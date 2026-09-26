<?php

use App\Http\Controllers\Api\V1\Boutique\Dashboard\StoreVisitController;
use Illuminate\Support\Facades\Route;

Route::post('/analytics/visits', StoreVisitController::class)
    ->middleware('throttle:120,1');
