<?php

use App\Http\Controllers\Api\V1\Boutique\Order\OrderController;
use App\Http\Controllers\Api\V1\Boutique\Order\PaymentController;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], '/payments/cinetpay/webhook', [PaymentController::class, 'webhook']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store'])->middleware('is.customer');
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::post('/payments/cinetpay/verify', [PaymentController::class, 'verify']);
    Route::post('/orders/{id}/payment/retry', [PaymentController::class, 'retry']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});

Route::middleware(['auth:api', 'is.admin'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});
