<?php

namespace App\Repositories\Eloquent\Orders;

use App\Models\Boutique\Cart;
use App\Models\Boutique\Order;
use App\Models\User;
use App\Notifications\NewOrderPlaced;
use App\Notifications\OrderCancelled;
use App\Notifications\OrderStatusUpdated;
use App\Repositories\Contracts\Orders\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderRepository implements OrderRepositoryInterface
{
    public function createFromCart(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

            if (! $cart || $cart->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Votre panier est vide.'],
                ]);
            }

            $total = 0;

            // Vérification finale du stock avant de valider
            foreach ($cart->items as $item) {
                $product = $item->product()->lockForUpdate()->first();

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'product' => ["Le produit \"{$item->product->name}\" n'est plus disponible."],
                    ]);
                }

                if ($product->stock_quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => ["Stock insuffisant pour \"{$product->name}\". Disponible : {$product->stock_quantity}."],
                    ]);
                }

                $total += $product->final_price * $item->quantity;
            }

            $order = Order::create([
                'user_id' => $user->id,
                'analytics_visitor_id' => $data['analytics_visitor_id'] ?? null,
                'status' => 'pending',
                'payment_method' => $data['payment_method'] ?? 'cash_on_delivery',
                'payment_status' => ($data['payment_method'] ?? 'cash_on_delivery') === 'cinetpay' ? 'pending' : 'unpaid',
                'total' => $total,
                'shipping_address' => $data['shipping_address'],
                'phone' => $data['phone'],
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                $product = $item->product;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->final_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $product->final_price * $item->quantity,
                ]);

                $product->decrement('stock_quantity', $item->quantity);
            }

            $cart->items()->delete();
            if ($order->payment_method === 'cash_on_delivery') {
                User::where('is_admin', true)->get()->each(function ($admin) use ($order) {
                    $admin->notify(new NewOrderPlaced($order));
                });
            }

            return $order->load('items');
        });
    }

    public function myOrders(User $user): LengthAwarePaginator
    {
        return Order::with(['items.product:id,images'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function find(string $id): ?Order
    {
        return Order::with(['items', 'user'])->find($id);
    }

    public function cancel(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            if ($order->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => ['Seule une commande en attente peut être annulée.'],
                ]);
            }

            if ($order->payment_method === 'cinetpay' && $order->payment_status === 'pending') {
                throw ValidationException::withMessages([
                    'payment' => ['Vérifie ou termine le paiement avant d’annuler cette commande.'],
                ]);
            }

            foreach ($order->items as $item) {
                $item->product()->increment('stock_quantity', $item->quantity);
            }

            $order->update(['status' => 'cancelled']);
            $cancelledOrder = $order->fresh(['items', 'user']);
            $this->notifyAdminsOfCancellation($cancelledOrder);

            return $cancelledOrder;
        });
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Order::with(['items', 'user']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $wasCancelled = $order->status === 'cancelled';
        if ($order->payment_method === 'cinetpay' && $order->payment_status !== 'paid' && $status !== 'cancelled') {
            throw ValidationException::withMessages([
                'payment' => ['Cette commande ne peut être traitée qu’après confirmation du paiement.'],
            ]);
        }
        if ($order->payment_method === 'cinetpay' && $order->payment_status === 'pending' && $status === 'cancelled') {
            throw ValidationException::withMessages([
                'payment' => ['Vérifie ou termine le paiement avant d’annuler cette commande.'],
            ]);
        }
        if ($order->payment_method === 'cinetpay' && $order->payment_status === 'paid' && $status === 'cancelled') {
            throw ValidationException::withMessages([
                'payment' => ['Rembourse d’abord le paiement CinetPay avant d’annuler cette commande.'],
            ]);
        }
        if ($status === 'cancelled' && ! $wasCancelled) {
            foreach ($order->items as $item) {
                $item->product()->increment('stock_quantity', $item->quantity);
            }
        }
        $order->update(['status' => $status]);
        $updatedOrder = $order->fresh(['items', 'user']);
        $updatedOrder->user->notify(new OrderStatusUpdated($updatedOrder));

        if ($status === 'cancelled' && ! $wasCancelled) {
            $this->notifyAdminsOfCancellation($updatedOrder);
        }

        return $updatedOrder;
    }

    private function notifyAdminsOfCancellation(Order $order): void
    {
        User::where('is_admin', true)->get()->each(function (User $admin) use ($order) {
            $admin->notify(new OrderCancelled($order));
        });
    }
}
