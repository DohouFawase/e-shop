<?php

use App\Http\Controllers\Api\V1\Contact\ContactController;
use Illuminate\Support\Facades\Route;

Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1');

Route::middleware(['auth:api', 'is.admin'])
    ->prefix('dashboard/contact-messages')
    ->group(function () {
        Route::get('/', [ContactController::class, 'index']);
        Route::post('/{contactMessage}/read', [ContactController::class, 'markRead']);
        Route::post('/{contactMessage}/replies', [ContactController::class, 'reply']);
    });
