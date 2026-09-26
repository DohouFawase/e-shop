<?php

use App\Http\Controllers\Api\V1\Notification\NotificationController;
use App\Http\Controllers\Api\V1\Notification\PushSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api'])->prefix('notifications')->group(function () {
    Route::prefix('push')->group(function () {
        Route::get('/vapid-public-key', [PushSubscriptionController::class, 'publicKey']);
        Route::post('/subscriptions', [PushSubscriptionController::class, 'store']);
        Route::delete('/subscriptions', [PushSubscriptionController::class, 'destroy']);
    });
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
});
