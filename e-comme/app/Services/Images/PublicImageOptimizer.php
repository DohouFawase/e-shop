<?php

namespace App\Services\Images;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class PublicImageOptimizer
{
    private const MAX_EDGE = 1800;
    private const WEBP_QUALITY = 78;

    public function storeUpload(UploadedFile $file, string $directory): string
    {
        $contents = file_get_contents($file->getRealPath());
        $optimized = is_string($contents) ? $this->toWebp($contents) : null;

        if ($optimized === null) {
            return $file->store($directory, 'public');
        }

        $path = trim($directory, '/') . '/' . Str::uuid() . '.webp';
        if (! Storage::disk('public')->put($path, $optimized)) {
            throw new RuntimeException('Impossible d’enregistrer l’image optimisée.');
        }

        return $path;
    }

    /** Create an optimized sibling file; the original remains available for rollback. */
    public function optimizeStored(string $path): ?string
    {
        if (str_ends_with(strtolower($path), '.webp') || str_ends_with(strtolower($path), '.gif')) {
            return null;
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($path)) {
            return null;
        }

        $optimized = $this->toWebp($disk->get($path));
        if ($optimized === null) {
            return null;
        }

        $newPath = preg_replace('/\.[^.]+$/', '', $path) . '.optimized.webp';
        if (! $disk->put($newPath, $optimized)) {
            return null;
        }

        return $newPath;
    }

    private function toWebp(string $contents): ?string
    {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagewebp')) {
            return null;
        }

        $imageInfo = @getimagesizefromstring($contents);
        if (! is_array($imageInfo) || ! in_array($imageInfo[2] ?? null, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            return null;
        }

        [$width, $height] = $imageInfo;
        if ($width < 1 || $height < 1 || $width * $height > 40_000_000) {
            return null;
        }

        $source = @imagecreatefromstring($contents);
        if (! $source) {
            return null;
        }

        $scale = min(1, self::MAX_EDGE / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
        imagefill($target, 0, 0, $transparent);
        imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        ob_start();
        $success = imagewebp($target, null, self::WEBP_QUALITY);
        $result = ob_get_clean();
        imagedestroy($source);
        imagedestroy($target);

        return $success && is_string($result) ? $result : null;
    }
}
