<?php

namespace App\Repositories\Contracts\Favorites;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface FavoriteRepositoryInterface
{
    public function myFavorites(User $user): Collection;
    public function toggle(User $user, string $productId): array;
}