<?php

namespace App\Repositories\Eloquent\Carts;

use App\Models\Boutique\Cart;
use App\Models\Boutique\Product;
use App\Models\User;
use App\Repositories\Contracts\Carts\CartRepositoryInterface;
use Illuminate\Validation\ValidationException;

class CartRepository implements CartRepositoryInterface
{
    public function getOrCreate(User $user): Cart
    {
        $cart = Cart::with('items.product')->firstOrCreate(['user_id' => $user->id]);

        return $cart->load('items.product');
    }

    public function addItem(User $user, string $productId, int $quantity): Cart
    {
        $product = Product::findOrFail($productId);
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        if ($cart->items()->where('product_id', $productId)->exists()) {
            throw ValidationException::withMessages([
                'product_id' => ['Ce produit existe déjà dans votre panier.'],
            ]);
        }

        if ($product->stock_quantity < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => ["Stock insuffisant. Disponible : {$product->stock_quantity}."],
            ]);
        }

        $cart->items()->create([
            'product_id' => $productId,
            'quantity' => $quantity,
        ]);
        $this->touchCartForCustomerActivity($cart);

        return $cart->load('items.product');
    }

    public function updateItemQuantity(User $user, string $productId, int $quantity): Cart
    {
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $product = Product::findOrFail($productId);

        if ($product->stock_quantity < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => ["Stock insuffisant. Disponible : {$product->stock_quantity}."],
            ]);
        }

        $item = $cart->items()->where('product_id', $productId)->firstOrFail();
        $item->update(['quantity' => $quantity]);
        $this->touchCartForCustomerActivity($cart);

        return $cart->load('items.product');
    }

    public function removeItem(User $user, string $productId): Cart
    {
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $cart->items()->where('product_id', $productId)->delete();
        $this->touchCartForCustomerActivity($cart);

        return $cart->load('items.product');
    }

    public function clear(User $user): bool
    {
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return true;
        }

        $deleted = (bool) $cart->items()->delete();
        $cart->forceFill(['abandoned_reminder_sent_at' => null])->save();

        return $deleted;
    }

    private function touchCartForCustomerActivity(Cart $cart): void
    {
        $cart->forceFill(['abandoned_reminder_sent_at' => null])->save();
        $cart->touch();
    }
}