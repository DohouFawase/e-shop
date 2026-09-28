<?php

namespace App\Http\Controllers\Api\V1\Boutique\Order;

use App\Http\Controllers\Controller;
use App\Models\Boutique\Order;
use App\Services\Payments\CinetPayPaymentService;
use App\Services\Payments\PaystackPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class PaymentController extends Controller
{
    public function retry(
        Request $request,
        string $id,
        CinetPayPaymentService $cinetPay,
        PaystackPaymentService $paystack,
    ): JsonResponse {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);
        $provider = $order->payment_provider ?: $order->payment_method;
        if (! in_array($provider, ['cinetpay', 'paystack'], true) || $order->status === 'cancelled') {
            return response()->json(['message' => 'Cette commande ne peut pas être payée en ligne.'], 422);
        }
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Cette commande est déjà payée.', 'payment_status' => 'paid']);
        }

        try {
            $payment = $provider === 'paystack'
                ? $paystack->initialize($order)
                : $cinetPay->initialize($order);

            return response()->json(['payment' => $payment]);
        } catch (Throwable $exception) {
            $order->forceFill(['payment_status' => 'failed'])->save();
            Log::warning('Échec de la reprise du paiement en ligne', [
                'order_id' => $order->id,
                'provider' => $provider,
            ]);

            return response()->json(['message' => $exception->getMessage()], 503);
        }
    }

    public function verify(
        Request $request,
        CinetPayPaymentService $cinetPay,
        PaystackPaymentService $paystack,
    ): JsonResponse {
        $data = $request->validate(['reference' => ['required', 'string', 'max:100']]);
        $order = Order::where('payment_reference', $data['reference'])->first();
        if (! $order || (string) $order->user_id !== (string) $request->user()->id) {
            return response()->json(['message' => 'Référence de paiement introuvable.'], 404);
        }

        $provider = $order->payment_provider ?: $order->payment_method;
        if (! in_array($provider, ['cinetpay', 'paystack'], true)) {
            return response()->json(['message' => 'Cette commande n’a pas de paiement en ligne à vérifier.'], 422);
        }

        try {
            $result = $provider === 'paystack'
                ? $paystack->verifyAndRecord($data['reference'])
                : $cinetPay->verifyAndRecord($data['reference']);

            return response()->json($result);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (Throwable $exception) {
            Log::error('Erreur de vérification du paiement', [
                'order_id' => $order->id,
                'provider' => $provider,
            ]);

            return response()->json(['message' => 'Impossible de vérifier le paiement pour le moment.'], 502);
        }
    }

    public function webhook(Request $request, CinetPayPaymentService $payments): JsonResponse
    {
        if ($request->isMethod('get')) {
            return response()->json(['received' => true]);
        }

        $reference = $request->input('cpm_trans_id', $request->input('transaction_id'));
        if (! is_string($reference) || $reference === '') {
            return response()->json(['message' => 'Référence absente.'], 422);
        }

        try {
            $payments->verifyAndRecord($reference);

            return response()->json(['received' => true]);
        } catch (Throwable $exception) {
            Log::error('Échec de traitement du webhook CinetPay', ['reference' => $reference]);

            return response()->json(['message' => 'Le paiement n’a pas pu être vérifié.'], 500);
        }
    }

    public function paystackWebhook(Request $request, PaystackPaymentService $payments): JsonResponse
    {
        $secretKey = config('services.paystack.secret_key');
        $signature = $request->header('x-paystack-signature');
        if (! is_string($secretKey) || $secretKey === '' || ! is_string($signature)) {
            return response()->json(['message' => 'Signature invalide.'], 401);
        }

        $expectedSignature = hash_hmac('sha512', $request->getContent(), $secretKey);
        if (! hash_equals($expectedSignature, $signature)) {
            return response()->json(['message' => 'Signature invalide.'], 401);
        }

        $payload = json_decode($request->getContent(), true);
        if (! is_array($payload)) {
            return response()->json(['message' => 'Événement invalide.'], 400);
        }
        if (($payload['event'] ?? null) !== 'charge.success') {
            return response()->json(['received' => true]);
        }

        $reference = $payload['data']['reference'] ?? null;
        if (! is_string($reference) || $reference === '') {
            return response()->json(['message' => 'Référence absente.'], 422);
        }

        try {
            $payments->verifyAndRecord($reference);

            return response()->json(['received' => true]);
        } catch (Throwable $exception) {
            Log::error('Échec de traitement du webhook Paystack', ['reference' => $reference]);

            return response()->json(['message' => 'Le paiement n’a pas pu être vérifié.'], 500);
        }
    }
}
