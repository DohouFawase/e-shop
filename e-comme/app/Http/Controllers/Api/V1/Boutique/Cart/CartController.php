<?php

namespace App\Http\Controllers\Api\V1\Boutique\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Repositories\Contracts\Carts\CartRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class CartController extends Controller
{
    protected $cartRepository;

    public function __construct(CartRepositoryInterface $cartRepository)
    {
        $this->cartRepository = $cartRepository;
    }

    public function show(Request $request)
    {
        try {
            $cart = $this->cartRepository->getOrCreate($request->user());

            return response()->json(['cart' => $cart]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération panier', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function addItem(AddCartItemRequest $request)
    {
        try {
            $cart = $this->cartRepository->addItem(
                $request->user(),
                $request->validated('product_id'),
                $request->validated('quantity')
            );

            return response()->json([
                'message' => 'Produit ajouté au panier.',
                'cart' => $cart,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => collect($e->errors())->flatten()->first() ?? $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Erreur ajout au panier', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function updateItem(UpdateCartItemRequest $request, string $productId)
    {
        try {
            $cart = $this->cartRepository->updateItemQuantity(
                $request->user(),
                $productId,
                $request->validated('quantity')
            );

            return response()->json([
                'message' => 'Quantité mise à jour.',
                'cart' => $cart,
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (Throwable $e) {
            Log::error('Erreur mise à jour panier', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function removeItem(Request $request, string $productId)
    {
        try {
            $cart = $this->cartRepository->removeItem($request->user(), $productId);

            return response()->json([
                'message' => 'Produit retiré du panier.',
                'cart' => $cart,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur suppression article panier', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            $this->cartRepository->clear($request->user());

            return response()->json(['message' => 'Panier vidé avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur vidage panier', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
}