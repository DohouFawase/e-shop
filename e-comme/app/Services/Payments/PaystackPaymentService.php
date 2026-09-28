<?php

namespace App\Services\Payments;

use App\Models\Boutique\Order;
use App\Notifications\OrderPaymentStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class PaystackPaymentService
{
    private const API_URL = 'https://api.paystack.co';

    /** @return array{authorization_url: string, reference: string} */
    public function initialize(Order $order): array
    {
        $secretKey = config('services.paystack.secret_key');
        if (! is_string($secretKey) || $secretKey === '') {
            throw new RuntimeException('Le paiement Paystack n’est pas encore configuré.');
        }

        if ($order->payment_status === 'pending' && $order->payment_authorization_url && $order->payment_reference) {
            return ['authorization_url' => $order->payment_authorization_url, 'reference' => $order->payment_reference];
        }

        $amount = (int) round((float) $order->total);
        if ($amount < 1) {
            throw new RuntimeException('Le montant de la commande est invalide.');
        }

        $order->loadMissing('user');
        $reference = 'ORDER-'.$order->id.'-'.Str::upper((string) Str::uuid());
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        $order->forceFill([
            'payment_method' => 'paystack',
            'payment_provider' => 'paystack',
            'payment_status' => 'pending',
            'payment_reference' => $reference,
            'payment_authorization_url' => null,
        ])->save();

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->post(self::API_URL.'/transaction/initialize', [
                'email' => $order->user->email,
                'amount' => (string) ($amount * 100),
                'currency' => 'XOF',
                'reference' => $reference,
                'callback_url' => $frontendUrl.'/payment/callback',
                'metadata' => [
                    'order_id' => (string) $order->id,
                ],
            ]);

        $authorizationUrl = $response->json('data.authorization_url');
        $responseReference = $response->json('data.reference');
        if (! $response->successful() || $response->json('status') !== true || ! is_string($authorizationUrl) || ! is_string($responseReference) || $responseReference !== $reference) {
            $order->forceFill(['payment_status' => 'failed'])->save();
            throw new RuntimeException('Paystack n’a pas pu démarrer le paiement. Réessaie depuis tes commandes.');
        }

        $order->forceFill(['payment_authorization_url' => $authorizationUrl])->save();

        return ['authorization_url' => $authorizationUrl, 'reference' => $responseReference];
    }

    /** @return array{status: string, order: Order} */
    public function verifyAndRecord(string $reference): array
    {
        $secretKey = config('services.paystack.secret_key');
        if (! is_string($secretKey) || $secretKey === '') {
            throw new RuntimeException('Le paiement Paystack n’est pas configuré.');
        }

        $order = Order::where('payment_reference', $reference)
            ->where('payment_provider', 'paystack')
            ->firstOrFail();

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->get(self::API_URL.'/transaction/verify/'.rawurlencode($reference));

        $transaction = $response->json('data');
        if (! $response->successful() || $response->json('status') !== true || ! is_array($transaction)) {
            throw new RuntimeException('Impossible de vérifier le paiement auprès de Paystack.');
        }

        if ((string) ($transaction['reference'] ?? '') !== $reference) {
            throw new RuntimeException('La référence confirmée ne correspond pas à la commande.');
        }

        $providerStatus = strtolower((string) ($transaction['status'] ?? ''));
        if ($providerStatus !== 'success') {
            if (in_array($providerStatus, ['failed', 'abandoned', 'reversed'], true)) {
                $justFailed = false;
                $failedOrder = DB::transaction(function () use ($order, &$justFailed): Order {
                    $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
                    if (! in_array($lockedOrder->payment_status, ['paid', 'failed'], true)) {
                        $lockedOrder->forceFill([
                            'payment_status' => 'failed',
                            'payment_authorization_url' => null,
                        ])->save();
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

        $expectedAmount = (int) round((float) $order->total) * 100;
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
                    'provider_transaction_id' => (string) ($transaction['id'] ?? $transaction['reference']),
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
