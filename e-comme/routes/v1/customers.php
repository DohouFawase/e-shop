<?php

use App\Http\Controllers\Api\V1\Boutique\Customer\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api', 'is.admin'])->group(function () {
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
});
