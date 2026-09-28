<?php

namespace App\Services\Payments;

use App\Models\Boutique\Order;
use App\Notifications\OrderPaymentStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class CinetPayPaymentService
{
    private const API_URL = 'https://api-checkout.cinetpay.com/v2';

    /** @return array{authorization_url: string, reference: string} */
    public function initialize(Order $order): array
    {
        $apiKey = config('services.cinetpay.api_key');
        $siteId = config('services.cinetpay.site_id');
        if (! is_string($apiKey) || $apiKey === '' || ! is_string($siteId) || $siteId === '') {
            throw new RuntimeException('Le paiement CinetPay n’est pas encore configuré.');
        }

        if ($order->payment_status === 'pending' && $order->payment_authorization_url && $order->payment_reference) {
            return ['authorization_url' => $order->payment_authorization_url, 'reference' => $order->payment_reference];
        }

        $amount = (int) round((float) $order->total);
        if ($amount < 100 || $amount % 5 !== 0) {
            throw new RuntimeException('Le montant doit être supérieur ou égal à 100 XOF et être un multiple de 5.');
        }

        $order->loadMissing('user');
        $reference = (string) Str::uuid();
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $notifyUrl = rtrim((string) config('app.url'), '/').'/api/payments/cinetpay/webhook';

        $order->forceFill([
            'payment_method' => 'cinetpay',
            'payment_provider' => 'cinetpay',
            'payment_status' => 'pending',
            'payment_reference' => $reference,
            'payment_authorization_url' => null,
        ])->save();

        $response = Http::acceptJson()
            ->timeout(15)
            ->post(self::API_URL.'/payment', [
                'apikey' => $apiKey,
                'site_id' => $siteId,
                'transaction_id' => $reference,
                'amount' => $amount,
                'currency' => 'XOF',
                'description' => 'Commande '.$order->id,
                'return_url' => $frontendUrl.'/payment/callback',
                'notify_url' => $notifyUrl,
                'channels' => 'ALL',
                'lang' => 'fr',
                'metadata' => (string) $order->id,
                'customer_id' => (string) $order->user_id,
                'customer_name' => $order->user->last_name ?: $order->user->first_name,
                'customer_surname' => $order->user->first_name,
                'customer_email' => $order->user->email,
                'customer_phone_number' => $order->phone,
            ]);

        $authorizationUrl = $response->json('data.payment_url');
        if (! $response->successful() || $response->json('code') !== '201' || ! is_string($authorizationUrl)) {
            $order->forceFill(['payment_status' => 'failed'])->save();
            throw new RuntimeException('CinetPay n’a pas pu démarrer le paiement. Réessaie depuis tes commandes.');
        }

        $order->forceFill(['payment_authorization_url' => $authorizationUrl])->save();

        return ['authorization_url' => $authorizationUrl, 'reference' => $reference];
    }

    /** @return array{status: string, order: Order} */
    public function verifyAndRecord(string $reference): array
    {
        $apiKey = config('services.cinetpay.api_key');
        $siteId = config('services.cinetpay.site_id');
        if (! is_string($apiKey) || $apiKey === '' || ! is_string($siteId) || $siteId === '') {
            throw new RuntimeException('Le paiement CinetPay n’est pas configuré.');
        }

        $order = Order::where('payment_reference', $reference)->firstOrFail();
        $response = Http::acceptJson()
            ->timeout(15)
            ->post(self::API_URL.'/payment/check', [
                'apikey' => $apiKey,
                'site_id' => $siteId,
                'transaction_id' => $reference,
            ]);

        $transaction = $response->json('data');
        if (! $response->successful() || ! is_array($transaction)) {
            throw new RuntimeException('Impossible de vérifier le paiement auprès de CinetPay.');
        }

        $providerStatus = strtoupper((string) ($transaction['status'] ?? ''));
        if ($providerStatus !== 'ACCEPTED') {
            if (in_array($providerStatus, ['REFUSED', 'CANCELLED'], true)) {
                $justFailed = false;
                $failedOrder = DB::transaction(function () use ($order, &$justFailed): Order {
                    $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
                    if (! in_array($lockedOrder->payment_status, ['paid', 'failed'], true)) {
                        $lockedOrder->forceFill(['payment_status' => 'failed', 'payment_authorization_url' => null])->save();
                        $justFailed = true;
                    }

                    return $lockedOrder->fresh(['items', 'user']);
                });

                if ($justFailed && $failedOrder->user) {
                    $failedOrder->user->notify(new OrderPaymentStatusUpdated($failedOrder, false));
                }

                return ['status' => 'failed', 'order' => $failedOrder];
            }

            return ['status' => 'pending', 'order' => $order->fresh('items')];
        }

        if ((string) ($transaction['transaction_id'] ?? '') !== $reference) {
            throw new RuntimeException('La référence confirmée ne correspond pas à la commande.');
        }

        $expectedAmount = (int) round((float) $order->total);
        if ((int) ($transaction['amount'] ?? 0) !== $expectedAmount || strtoupper((string) ($transaction['currency'] ?? '')) !== 'XOF') {
            throw new RuntimeException('Le montant ou la devise du paiement ne correspond pas à la commande.');
        }

        $justPaid = false;
        $paidOrder = DB::transaction(function () use ($order, $transaction, &$justPaid): Order {
            $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            if ($lockedOrder->payment_status !== 'paid') {
                if ($lockedOrder->status === 'cancelled') {
                    throw new RuntimeException('Cette commande a été annulée; contacte le support pour le remboursement.');
                }

                $lockedOrder->forceFill([
                    'payment_status' => 'paid',
                    'payment_authorization_url' => null,
                    'provider_transaction_id' => (string) ($transaction['operator_id'] ?? $reference),
                    'paid_at' => now(),
                ])->save();
                $justPaid = true;
            }

            return $lockedOrder->fresh(['items', 'user']);
        });

        if ($justPaid) {
            $paidOrder->user?->notify(new OrderPaymentStatusUpdated($paidOrder, true));
        }

        return ['status' => 'paid', 'order' => $paidOrder];
    }
}
