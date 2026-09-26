<?php

namespace App\Repositories\Contracts\Orders;

use App\Models\Boutique\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function createFromCart(User $user, array $data): Order;
    public function myOrders(User $user): LengthAwarePaginator;
    public function find(string $id): ?Order;
    public function cancel(Order $order): Order;
    public function all(array $filters = []): LengthAwarePaginator;
    public function updateStatus(Order $order, string $status): Order;
}