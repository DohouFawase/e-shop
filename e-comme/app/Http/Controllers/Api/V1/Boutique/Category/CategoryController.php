<?php

namespace App\Http\Controllers\Api\V1\Boutique\Category;

use App\Http\Controllers\Controller;
use App\Http\Requests\Boutique\Category\CreateCategorieFormRequest;
use App\Http\Requests\Boutique\Category\UpdateCategorieFormRequest;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Repositories\Contracts\Categories\CategoryRepositoryInterface;
use App\Services\Images\PublicImageOptimizer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;


class CategoryController extends Controller
{
    //
    protected $categoryRepository;
    protected PublicImageOptimizer $imageOptimizer;

    public function __construct(CategoryRepositoryInterface $categoryRepository, PublicImageOptimizer $imageOptimizer)
    {
        $this->categoryRepository = $categoryRepository;
        $this->imageOptimizer = $imageOptimizer;
    }

    public function index()
    {
        try {
            return response()->json(['categories' => $this->categoryRepository->all()]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération catégories', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $category = $this->categoryRepository->find($id);

            if (!$category) {
                return response()->json(['message' => 'Catégorie introuvable.'], 404);
            }

            return response()->json(['category' => $category]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération catégorie', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function store(CreateCategorieFormRequest $request)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                $data['image'] = $this->imageOptimizer->storeUpload($request->file('image'), 'categories');
            }

            $category = $this->categoryRepository->create($data);

            return response()->json([
                'message' => 'Catégorie créée avec succès.',
                'category' => $category,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Erreur création catégorie', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la création.'], 500);
        }
    }

    public function update(UpdateCategorieFormRequest $request, string $id)
    {
        try {
            $category = $this->categoryRepository->find($id);

            if (!$category) {
                return response()->json(['message' => 'Catégorie introuvable.'], 404);
            }

            $data = $request->validated();

            if ($request->hasFile('image')) {
                if ($category->image) {
                    Storage::disk('public')->delete($category->image);
                }
                $data['image'] = $this->imageOptimizer->storeUpload($request->file('image'), 'categories');
            }

            $category = $this->categoryRepository->update($category, $data);

            return response()->json([
                'message' => 'Catégorie mise à jour avec succès.',
                'category' => $category,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur mise à jour catégorie', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la mise à jour.'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $category = $this->categoryRepository->find($id);

            if (!$category) {
                return response()->json(['message' => 'Catégorie introuvable.'], 404);
            }

            foreach ($category->products as $product) {
                foreach ($product->images ?? [] as $productImage) {
                    Storage::disk('public')->delete($productImage);
                }
            }

            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }

            $this->categoryRepository->delete($category);

            return response()->json(['message' => 'Catégorie supprimée avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur suppression catégorie', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }

     public function destroyAll()
    {
        try {
            $this->categoryRepository->deleteAll();

            return response()->json(['message' => 'Toutes les catégories ont été supprimées avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur suppression de toutes les catégories', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }
}
