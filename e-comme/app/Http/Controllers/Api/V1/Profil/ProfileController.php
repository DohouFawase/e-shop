<?php

namespace App\Http\Controllers\Api\V1\Profil;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Repositories\Contracts\Profile\ProfileRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Throwable;
class ProfileController extends Controller
{
    //
     protected $profileRepository;

    public function __construct(ProfileRepositoryInterface $profileRepository)
    {
        $this->profileRepository = $profileRepository;
    }

    public function show(Request $request)
    {
        try {
            return response()->json(['user' => $request->user()]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération profil', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function update(UpdateProfileRequest $request)
    {
        try {
            $user = $this->profileRepository->updateProfile($request->user(), $request->validated());

            return response()->json([
                'message' => 'Profil mis à jour avec succès.',
                'user' => $user,
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur mise à jour profil', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la mise à jour.'], 500);
        }
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        try {
            $success = $this->profileRepository->changePassword($request->user(), $request->validated());

            if (!$success) {
                return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
            }

            return response()->json(['message' => 'Mot de passe modifié avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur changement mot de passe', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function destroy(Request $request)
    {
        try {
            $this->profileRepository->deleteAccount($request->user());

            return response()->json(['message' => 'Compte supprimé avec succès.']);
        } catch (Throwable $e) {
            Log::error('Erreur suppression compte', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la suppression.'], 500);
        }
    }
}
