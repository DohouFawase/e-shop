<?php

namespace App\Repositories\Contracts\Reviews;

use App\Models\Boutique\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ReviewRepositoryInterface
{
    public function forProduct(string $productId): Collection;
    public function all(array $filters = []): LengthAwarePaginator;
    public function find(string $id): ?Review;
    public function delete(Review $review): bool;
    public function create(User $user, array $data): Review;
    public function canReview(User $user, string $orderItemId): bool;
}