<?php

use App\Http\Controllers\Api\V1\Boutique\Category\CategoryController;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']); // renvoie désormais la catégorie + ses produits

Route::middleware(['auth:api', 'is.admin'])->group(function () {
    Route::delete('/categories/all', [CategoryController::class, 'destroyAll']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
});