<?php

namespace App\Http\Controllers\Api\V1\Boutique\Order;

use App\Http\Controllers\Controller;
use App\Models\Boutique\Order;
use App\Services\Payments\CinetPayPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class PaymentController extends Controller
{
    public function retry(Request $request, string $id, CinetPayPaymentService $payments)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);
        if ($order->payment_method !== 'cinetpay' || $order->status === 'cancelled') {
            return response()->json(['message' => 'Cette commande ne peut pas être payée avec CinetPay.'], 422);
        }
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Cette commande est déjà payée.', 'payment_status' => 'paid']);
        }

        try {
            return response()->json(['payment' => $payments->initialize($order)]);
        } catch (Throwable $exception) {
            $order->forceFill(['payment_status' => 'failed'])->save();
            Log::warning('Échec de l’initialisation CinetPay', ['order_id' => $order->id]);

            return response()->json(['message' => $exception->getMessage()], 503);
        }
    }

    public function verify(Request $request, CinetPayPaymentService $payments)
    {
        $data = $request->validate(['reference' => ['required', 'string', 'max:100']]);
        $order = Order::where('payment_reference', $data['reference'])->first();
        if (! $order || (string) $order->user_id !== (string) $request->user()->id) {
            return response()->json(['message' => 'Référence de paiement introuvable.'], 404);
        }

        try {
            return response()->json($payments->verifyAndRecord($data['reference']));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (Throwable $exception) {
            Log::error('Erreur de vérification CinetPay', ['order_id' => $order->id]);

            return response()->json(['message' => 'Impossible de vérifier le paiement pour le moment.'], 502);
        }
    }

    public function webhook(Request $request, CinetPayPaymentService $payments)
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
}
