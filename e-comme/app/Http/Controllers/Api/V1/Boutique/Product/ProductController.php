<?php

namespace App\Http\Controllers\Api\V1\Boutique\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Boutique\Product\CreateProductFormRequest;
use App\Http\Requests\Boutique\Product\UpdateProductFormRequest;
use App\Repositories\Contracts\Products\ProductRepositoryInterface;
use App\Services\Images\PublicImageOptimizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProductController extends Controller
{
    //

    protected $productRepository;
    protected PublicImageOptimizer $imageOptimizer;

    public function __construct(ProductRepositoryInterface $productRepository, PublicImageOptimizer $imageOptimizer)
    {
        $this->productRepository = $productRepository;
        $this->imageOptimizer = $imageOptimizer;
    }

    private function productFilters(Request $request): array
    {
        $filters = $request->only([
            'category_id', 'search', 'min_price', 'max_price',
            'in_stock', 'is_active', 'sort_by', 'sort_direction', 'per_page',
        ]);
        foreach (['in_stock', 'is_active'] as $booleanFilter) {
            if ($request->has($booleanFilter)) {
                $filters[$booleanFilter] = $request->boolean($booleanFilter);
            }
        }

        return $filters;
    }

    public function index(Request $request)
    {
        try {
            return response()->json($this->productRepository->all($this->productFilters($request)));
        } catch (Throwable $e) {
            Log::error('Erreur récupération produits', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function manage(Request $request)
    {
        try {
            return response()->json($this->productRepository->allForAdmin($this->productFilters($request)));
        } catch (Throwable $e) {
            Log::error('Erreur gestion des produits', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $product = $this->productRepository->find($id);

            if (!$product) {
                return response()->json(['message' => 'Produit introuvable.'], 404);
            }

            return response()->json(['product' => $product]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération produit', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function myProducts(Request $request)
    {
        try {
            return response()->json($this->productRepository->myProducts($request->user()));
        } catch (Throwable $e) {
            Log::error('Erreur récupération mes produits', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function store(CreateProductFormRequest $request)
    {
        try {
            $data = $request->validated();
            // Une liste vide n’est pas une liste de fichiers : ne pas écrire [] en base.
            if (empty($data['images'])) {
                unset($data['images']);
            }

            if ($request->hasFile('images')) {
                $data['images'] = array_map(
                    fn($file) => $this->imageOptimizer->storeUpload($file, 'products'),
                    $request->file('images')
                );
            }

            $product = $this->productRepository->create($request->user(), $data);

            return response()->json([
                'message' => 'Produit créé avec succès.',
                'product' => $product,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Erreur création produit', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la création.'], 500);
        }
    }

    public function update(UpdateProductFormRequest $request, string $id)
    {
        try {
            $product = $this->productRepository->find($id);

            if (!$product) {
                return response()->json(['message' => 'Produit introuvable.'], 404);
            }


            $data = $request->validated();
            // Une liste vide ne doit pas écraser les images déjà enregistrées.
            if (empty($data['images'])) {
                unset($data['images']);
            }

            if ($request->hasFile('images')) {
                if (!empty($product->images)) {
                    foreach ($product->images as $oldImage) {
                        Storage::disk('public')->delete($oldImage);
                    }
                }
                $data['images'] = array_map(
                    fn($file) => $this->imageOptimizer->storeUpload($file, 'products'),
                    $request->file('images')
                );
            }

            $product = $this->productRepository->update($product, $data);

            return response()->json([
                'message' => 'Produit mis à jour avec succès.',
                'product' => $product,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur mise à jour produit', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la mise à jour.'], 500);
        }
    }

    public function destroy(Request $request, string $id)
    {
        try {
            $product = $this->productRepository->find($id);

            if (!$product) {
                return response()->json(['message' => 'Produit introuvable.'], 404);
            }


            if (!empty($product->images)) {
                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }

            $this->productRepository->delete($product);

            return response()->json(['message' => 'Produit supprimé avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur suppression produit', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }

    public function destroyAll()
    {
        try {
            $this->productRepository->deleteAll();

            return response()->json(['message' => 'Tous les produits ont été supprimés avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur suppression de tous les produits', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }

    public function newArrivals()
    {
        try {
            $products = $this->productRepository->newArrivals();

            return response()->json([
                'products' => $products,
                'message' => $products->isEmpty() ? 'Aucun nouveau produit pour le moment.' : null,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération nouveaux produits', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function bestSellers()
    {
        try {
            $products = $this->productRepository->bestSellers();

            return response()->json([
                'products' => $products,
                'message' => $products->isEmpty() ? 'Aucune vente enregistrée pour le moment.' : null,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération meilleures ventes', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function latestProducts()
    {
        try {
            $products = $this->productRepository->latestProducts();

            return response()->json([
                'products' => $products,
                'message' => $products->isEmpty() ? 'Aucun produit disponible pour le moment.' : null,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération derniers produits', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
}
