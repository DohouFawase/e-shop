<?php

namespace App\Http\Controllers\Api\V1\Boutique\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Repositories\Contracts\Orders\OrderRepositoryInterface;
use App\Services\Payments\CinetPayPaymentService;
use App\Services\Payments\PaystackPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderController extends Controller
{
    protected $orderRepository;

    public function __construct(OrderRepositoryInterface $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    public function store(StoreOrderRequest $request, CinetPayPaymentService $cinetPay, PaystackPaymentService $paystack)
    {
        try {
            $orderData = $request->validated();
            $visitorId = $request->header('X-Visitor-Id');
            if (is_string($visitorId) && Str::isUuid($visitorId)) {
                $orderData['analytics_visitor_id'] = $visitorId;
            }
            $order = $this->orderRepository->createFromCart($request->user(), $orderData);
            $payment = null;
            $paymentError = null;

            $paymentMethod = $orderData['payment_method'] ?? 'cash_on_delivery';
            if (in_array($paymentMethod, ['cinetpay', 'paystack'], true)) {
                try {
                    $payment = $paymentMethod === 'paystack'
                        ? $paystack->initialize($order)
                        : $cinetPay->initialize($order);
                    $order->refresh();
                } catch (Throwable $paymentException) {
                    $order->forceFill(['payment_status' => 'failed'])->save();
                    $paymentError = $paymentException->getMessage();
                    Log::warning('Initialisation du paiement en ligne impossible', [
                        'order_id' => $order->id,
                        'provider' => $paymentMethod,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Commande créée avec succès.',
                'order' => $order,
                'payment' => $payment,
                'payment_error' => $paymentError,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (Throwable $e) {
            Log::error('Erreur création commande', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la création de la commande.'], 500);
        }
    }

    public function myOrders(Request $request)
    {
        try {
            return response()->json($this->orderRepository->myOrders($request->user()));
        } catch (Throwable $e) {
            Log::error('Erreur récupération commandes', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function show(Request $request, string $id)
    {
        try {
            $order = $this->orderRepository->find($id);

            if (! $order) {
                return response()->json(['message' => 'Commande introuvable.'], 404);
            }

            if ($order->user_id !== $request->user()->id && ! $request->user()->is_admin) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }

            return response()->json(['order' => $order]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération commande', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function cancel(Request $request, string $id)
    {
        try {
            $order = $this->orderRepository->find($id);

            if (! $order) {
                return response()->json(['message' => 'Commande introuvable.'], 404);
            }

            if ($order->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé.'], 403);
            }

            $order = $this->orderRepository->cancel($order);

            return response()->json([
                'message' => 'Commande annulée avec succès.',
                'order' => $order,
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (Throwable $e) {
            Log::error('Erreur annulation commande', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    // --- Admin ---

    public function index(Request $request)
    {
        try {
            $filters = $request->only(['status', 'per_page']);

            return response()->json($this->orderRepository->all($filters));
        } catch (Throwable $e) {
            Log::error('Erreur récupération commandes (admin)', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function updateStatus(UpdateOrderStatusRequest $request, string $id)
    {
        try {
            $order = $this->orderRepository->find($id);

            if (! $order) {
                return response()->json(['message' => 'Commande introuvable.'], 404);
            }

            $order = $this->orderRepository->updateStatus($order, $request->validated('status'));

            return response()->json([
                'message' => 'Statut de la commande mis à jour.',
                'order' => $order,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur mise à jour statut commande', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
}
