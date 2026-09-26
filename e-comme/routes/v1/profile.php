<?php

use App\Http\Controllers\Api\V1\Profil\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api'])->group(function () {
    // ... tes routes existantes (logout, refresh, me, etc.)
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });
});
