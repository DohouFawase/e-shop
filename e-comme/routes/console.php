<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Schedule;
use App\Models\Boutique\Category;
use App\Models\Boutique\Product;
use App\Services\Images\PublicImageOptimizer;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id || $user->id === $id; // selon UUID ou int
});
// Le rappel part à partir de J+3; chaque job vide le panier à partir de J+7.
Schedule::command('carts:process-abandoned')->hourly()->withoutOverlapping();


Artisan::command('images:optimize', function () {
    $optimizer = app(PublicImageOptimizer::class);
    $updated = 0;
    $skipped = 0;

    Product::query()->each(function (Product $product) use ($optimizer, &$updated, &$skipped): void {
        $paths = $product->images ?? [];
        $newPaths = [];
        foreach ($paths as $path) {
            $optimized = $optimizer->optimizeStored($path);
            $newPaths[] = $optimized ?? $path;
            $optimized === null ? $skipped++ : $updated++;
        }
        if ($newPaths !== $paths) {
            $product->images = $newPaths;
            $product->saveQuietly();
        }
    });

    Category::query()->each(function (Category $category) use ($optimizer, &$updated, &$skipped): void {
        if (! $category->image) {
            return;
        }
        $optimized = $optimizer->optimizeStored($category->image);
        if ($optimized !== null) {
            $category->image = $optimized;
            $category->saveQuietly();
            $updated++;
        } else {
            $skipped++;
        }
    });

    $this->info("Images optimisées : {$updated}. Images ignorées : {$skipped}.");
    $this->comment('Les fichiers originaux sont conservés dans storage/app/public.');
})->purpose('Convertir les images produits et catégories existantes en WebP allégé');
