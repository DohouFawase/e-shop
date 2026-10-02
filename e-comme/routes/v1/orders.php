<?php

use App\Http\Controllers\Api\V1\Boutique\Order\OrderController;
use App\Http\Controllers\Api\V1\Boutique\Order\PaymentController;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], '/payments/cinetpay/webhook', [PaymentController::class, 'webhook'])->middleware('throttle:60,1');
Route::post('/payments/paystack/webhook', [PaymentController::class, 'paystackWebhook'])->middleware('throttle:60,1');

Route::middleware(['auth:api'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store'])->middleware(['is.customer', 'throttle:10,1']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::post('/payments/verify', [PaymentController::class, 'verify'])->middleware('throttle:10,1');
    Route::post('/payments/cinetpay/verify', [PaymentController::class, 'verify'])->middleware('throttle:10,1');
    Route::post('/orders/{id}/payment/retry', [PaymentController::class, 'retry'])->middleware('throttle:5,1');
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});

Route::middleware(['auth:api', 'is.admin'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});
