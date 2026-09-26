<?php

namespace App\Repositories\Contracts\Products;

use App\Models\Boutique\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator;
    public function allForAdmin(array $filters = []): LengthAwarePaginator;
    public function find(string $id): ?Product;
    public function myProducts(User $user): LengthAwarePaginator;
    public function create(User $user, array $data): Product;
    public function update(Product $product, array $data): Product;
    public function delete(Product $product): bool;
    public function newArrivals(int $limit = 8): Collection;
    public function bestSellers(int $limit = 8): Collection;
    public function latestProducts(int $limit = 8): Collection;
    public function deleteAll(): bool;
}