<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\Auth\AuthRepositoryInterface;
use App\Repositories\Contracts\Carts\CartRepositoryInterface;
use App\Repositories\Contracts\Categories\CategoryRepositoryInterface;
use App\Repositories\Contracts\Products\ProductRepositoryInterface;
use App\Repositories\Contracts\Profile\ProfileRepositoryInterface;
use App\Repositories\Eloquent\Auth\AuthRepository;
use App\Repositories\Eloquent\Categories\CategoryRepository;
use App\Repositories\Eloquent\Profile\ProfileRepository;
use App\Repositories\Eloquent\Products\ProductRepository;
use App\Repositories\Eloquent\Carts\CartRepository;
use App\Repositories\Contracts\Orders\OrderRepositoryInterface;
use App\Repositories\Eloquent\Orders\OrderRepository;
use App\Repositories\Contracts\Favorites\FavoriteRepositoryInterface;
use App\Repositories\Eloquent\Favorites\FavoriteRepository;
use App\Repositories\Contracts\Reviews\ReviewRepositoryInterface;
use App\Repositories\Eloquent\Reviews\ReviewRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
        $this->app->bind(ProfileRepositoryInterface::class, ProfileRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(CartRepositoryInterface::class, CartRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);

        $this->app->bind(FavoriteRepositoryInterface::class, FavoriteRepository::class);
        $this->app->bind(ReviewRepositoryInterface::class, ReviewRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
