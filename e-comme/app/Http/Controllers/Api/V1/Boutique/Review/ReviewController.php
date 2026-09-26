<?php

namespace App\Http\Controllers\Api\V1\Boutique\Review;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Repositories\Contracts\Reviews\ReviewRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Throwable;

class ReviewController extends Controller
{
    protected $reviewRepository;

    public function __construct(ReviewRepositoryInterface $reviewRepository)
    {
        $this->reviewRepository = $reviewRepository;
    }

    public function forProduct(string $productId)
    {
        try {
            $reviews = $this->reviewRepository->forProduct($productId);

            return response()->json([
                'reviews' => $reviews,
                'message' => $reviews->isEmpty() ? 'Aucun avis pour ce produit.' : null,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération avis', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function store(StoreReviewRequest $request)
    {
        try {
            $review = $this->reviewRepository->create($request->user(), $request->validated());

            return response()->json([
                'message' => 'Avis publié avec succès.',
                'review' => $review,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Erreur création avis', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        return response()->json($this->reviewRepository->all($filters));
    }

    public function destroy(string $id)
    {
        $review = $this->reviewRepository->find($id);
        if (!$review) {
            return response()->json(['message' => 'Avis introuvable.'], 404);
        }

        try {
            $this->reviewRepository->delete($review);
            return response()->json(['message' => 'Avis supprimé.']);
        } catch (Throwable $e) {
            Log::error('Erreur suppression avis', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de supprimer cet avis.'], 500);
        }
    }

}