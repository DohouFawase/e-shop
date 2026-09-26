<?php

use App\Http\Middleware\IsAdminMiddleware;
use App\Http\Middleware\IsCustomerMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',

        health: '/up',
        using: function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/v1/auth.php'))
                ->group(base_path('routes/v1/category.php'))
                ->group(base_path('routes/v1/product.php'))
                ->group(base_path('routes/v1/cart.php'))
                ->group(base_path('routes/v1/orders.php'))
                ->group(base_path('routes/v1/dashboard.php'))
                ->group(base_path('routes/v1/analytics.php'))
                ->group(base_path('routes/v1/customers.php'))
                ->group(base_path('routes/v1/favory.php'))
                ->group(base_path('routes/v1/review.php'))
                ->group(base_path('routes/v1/notif.php'))
                ->group(base_path('routes/v1/profile.php'))
                ->group(base_path('routes/v1/contact.php'))
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
        $middleware->alias([
            'is.admin' => IsAdminMiddleware::class,
            'is.customer' => IsCustomerMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
