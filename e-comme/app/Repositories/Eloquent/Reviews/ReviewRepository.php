<?php

namespace App\Repositories\Eloquent\Reviews;

use App\Models\Boutique\OrderItem;
use App\Models\Boutique\Review;
use App\Models\User;
use App\Notifications\NewReviewSubmitted;
use App\Repositories\Contracts\Reviews\ReviewRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository implements ReviewRepositoryInterface
{
    public function forProduct(string $productId): Collection
    {
        return Review::with('user')
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = Review::with(['user:id,first_name,last_name,email', 'product:id,name']);

        if (! empty($filters['rating'])) {
            $query->where('rating', $filters['rating']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($query) use ($search) {
                $query->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($productQuery) => $productQuery->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('user', fn ($userQuery) => $userQuery
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);
    }

    public function find(string $id): ?Review
    {
        return Review::find($id);
    }

    public function delete(Review $review): bool
    {
        return (bool) $review->delete();
    }

    public function create(User $user, array $data): Review
    {
        $orderItem = OrderItem::findOrFail($data['order_item_id']);

        $review = Review::create([
            'user_id' => $user->id,
            'product_id' => $orderItem->product_id,
            'order_item_id' => $orderItem->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ])->load(['user', 'product']);

        User::where('is_admin', true)->get()->each(
            fn (User $admin) => $admin->notify(new NewReviewSubmitted($review)),
        );

        return $review;
    }

    public function canReview(User $user, string $orderItemId): bool
    {
        $orderItem = OrderItem::with('order')->find($orderItemId);

        if (! $orderItem || $orderItem->order->user_id !== $user->id) {
            return false;
        }

        if ($orderItem->order->status !== 'delivered') {
            return false;
        }

        return ! Review::where('user_id', $user->id)
            ->where('order_item_id', $orderItemId)
            ->exists();
    }
}
