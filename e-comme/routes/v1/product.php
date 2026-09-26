<?php

use App\Http\Controllers\Api\V1\Boutique\Product\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/best-sellers', [ProductController::class, 'bestSellers']);
Route::get('/products/latest', [ProductController::class, 'latestProducts']);
Route::middleware(['auth:api', 'is.admin'])->get('/products/manage', [ProductController::class, 'manage']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::middleware(['auth:api', 'is.admin'])->group(function () {
    Route::delete('/products/all', [ProductController::class, 'destroyAll']);
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
});
