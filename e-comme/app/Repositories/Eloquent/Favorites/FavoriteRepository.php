<?php

namespace App\Repositories\Eloquent\Favorites;

use App\Models\Boutique\Favorite;
use App\Models\User;
use App\Repositories\Contracts\Favorites\FavoriteRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class FavoriteRepository implements FavoriteRepositoryInterface
{
    public function myFavorites(User $user): Collection
    {
        return Favorite::with('product.category')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function toggle(User $user, string $productId): array
    {
        $favorite = Favorite::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return ['favorited' => false];
        }

        Favorite::create([
            'user_id' => $user->id,
            'product_id' => $productId,
        ]);

        return ['favorited' => true];
    }
}