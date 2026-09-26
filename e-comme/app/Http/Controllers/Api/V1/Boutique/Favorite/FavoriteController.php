<?php

namespace App\Http\Controllers\Api\V1\Boutique\Favorite;

use App\Http\Controllers\Controller;
use App\Http\Requests\Favorite\ToggleFavoriteRequest;
use App\Repositories\Contracts\Favorites\FavoriteRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class FavoriteController extends Controller
{
    protected $favoriteRepository;

    public function __construct(FavoriteRepositoryInterface $favoriteRepository)
    {
        $this->favoriteRepository = $favoriteRepository;
    }

    public function index(Request $request)
    {
        try {
            $favorites = $this->favoriteRepository->myFavorites($request->user());

            return response()->json([
                'favorites' => $favorites,
                'message' => $favorites->isEmpty() ? 'Aucun favori pour le moment.' : null,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération favoris', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function toggle(ToggleFavoriteRequest $request)
    {
        try {
            $result = $this->favoriteRepository->toggle($request->user(), $request->validated('product_id'));

            return response()->json([
                'message' => $result['favorited'] ? 'Ajouté aux favoris.' : 'Retiré des favoris.',
                'favorited' => $result['favorited'],
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur toggle favori', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
}