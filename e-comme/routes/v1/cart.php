<?php

use App\Http\Controllers\Api\V1\Boutique\Cart\CartController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api', 'is.customer'])->prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'show']);
    Route::post('/items', [CartController::class, 'addItem']);
    Route::put('/items/{productId}', [CartController::class, 'updateItem']);
    Route::delete('/items/{productId}', [CartController::class, 'removeItem']);
    Route::delete('/', [CartController::class, 'clear']);
});


