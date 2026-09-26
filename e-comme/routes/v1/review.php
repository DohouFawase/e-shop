<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Boutique\Review\ReviewController;

Route::get('/products/{productId}/reviews', [ReviewController::class, 'forProduct']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/reviews', [ReviewController::class, 'store']);
});

Route::middleware(['auth:api', 'is.admin'])->group(function () {
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});