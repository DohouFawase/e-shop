<?php

namespace App\Repositories\Eloquent\Categories;

use App\Models\Boutique\Category;
use App\Repositories\Contracts\Categories\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function all(): Collection
    {
        return Category::orderBy('name')->get();
    }

    public function find(string $id): ?Category
    {
        return Category::with(['products' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])->find($id);
    }

    public function create(array $data): Category
    {

        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
       
        $category->fill($data);
        $category->save();

        return $category->fresh();
    }

    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }

    public function deleteAll(): bool
    {
        $categories = Category::all();

        foreach ($categories as $category) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
        }

        return (bool) Category::query()->delete();
    }
}
