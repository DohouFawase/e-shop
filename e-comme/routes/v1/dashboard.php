<?php

use App\Http\Controllers\Api\V1\Boutique\Dashboard\DashboardStatsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api', 'is.admin'])
    ->get('/dashboard/stats', DashboardStatsController::class);
