<?php

namespace App\Repositories\Eloquent\Products;

use App\Models\Boutique\OrderItem;
use App\Models\Boutique\Product;
use App\Models\User;
use App\Repositories\Contracts\Products\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class ProductRepository implements ProductRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator
    {
        return $this->queryProducts($filters, true);
    }

    public function allForAdmin(array $filters = []): LengthAwarePaginator
    {
        return $this->queryProducts($filters, false);
    }

    private function queryProducts(array $filters, bool $activeOnly): LengthAwarePaginator
    {
        $query = Product::with('category');

        if ($activeOnly) {
            $query->where('is_active', true);
        } elseif (array_key_exists('is_active', $filters)) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['min_price']) && $filters['min_price'] !== '') {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price']) && $filters['max_price'] !== '') {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (!empty($filters['in_stock'])) {
            $query->where('stock_quantity', '>', 0);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = ['created_at', 'price', 'name', 'stock_quantity'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function find(string $id): ?Product
    {
        return Product::with('category')->find($id);
    }

    public function myProducts(User $user): LengthAwarePaginator
    {
        return Product::with('category')
            ->where('producer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function create(User $user, array $data): Product
    {
        $data['producer_id'] = $user->id;

        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->fill($data);
        $product->save();

        return $product->fresh('category');
    }

    public function delete(Product $product): bool
    {
        return (bool) $product->delete();
    }

    public function deleteAll(): bool
    {
        $products = Product::all();

        foreach ($products as $product) {
            if (!empty($product->images)) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
        }

        return (bool) Product::query()->delete();
    }

    public function newArrivals(int $limit = 8): Collection
    {
        return Product::with('category')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

   public function bestSellers(int $limit = 8): Collection
{
    $topProductIds = OrderItem::select('product_id')
        ->selectRaw('SUM(quantity) as total_sold')
        ->groupBy('product_id')
        ->orderByDesc('total_sold')
        ->limit($limit)
        ->pluck('product_id');

    $products = Product::with('category')
        ->whereIn('id', $topProductIds)
        ->where('is_active', true)
        ->get();

    return $products
        ->sortBy(fn (Product $product) => $topProductIds->search($product->id))
        ->values();
}

    public function latestProducts(int $limit = 8): Collection
    {
        return Product::with('category')
            ->where('is_active', true)
            ->where('created_at', '>=', now()->subWeeks(2))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
