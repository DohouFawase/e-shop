<?php

namespace App\Repositories\Contracts\Carts;
use App\Models\Boutique\Cart;
use App\Models\User;
interface CartRepositoryInterface
{
    //
     public function getOrCreate(User $user): Cart;
    public function addItem(User $user, string $productId, int $quantity): Cart;
    public function updateItemQuantity(User $user, string $productId, int $quantity): Cart;
    public function removeItem(User $user, string $productId): Cart;
    public function clear(User $user): bool;
}
