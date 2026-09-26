<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Repositories\Contracts\Auth\AuthRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use Throwable;

class AuthController extends Controller
{
    protected $authRepository;

    public function __construct(AuthRepositoryInterface $authRepository)
    {
        $this->authRepository = $authRepository;
    }

    public function register(RegisterRequest $request)
    {
        try {
            $result = $this->authRepository->register($request->validated());

            return response()->json([
                'message' => 'Inscription réussie. Veuillez vérifier votre boîte mail.',
                'user' => $result['user'],
                'access_token' => $result['token'],
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Erreur inscription', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'inscription.',
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $result = $this->authRepository->login($request->validated());

            if (!$result) {
                return response()->json(['message' => 'Identifiants invalides'], 401);
            }

            $user = $result['user'] ?? User::where('email', $request->validated()['email'])->first();
            if ($user) {
                $user->forceFill(['last_login_at' => now()])->save();
            }

            return response()->json([
                'message' => 'Connexion réussie',
                'user' => $user,
                'access_token' => $result['token'],
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
            ]);
        } catch (JWTException $e) {
            Log::error('Erreur création token JWT', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Impossible de créer le token'], 500);
        } catch (Throwable $e) {
            Log::error('Erreur connexion', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la connexion.'], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $this->authRepository->logout();

            return response()->json(['message' => 'Déconnexion réussie']);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token invalide'], 401);
        } catch (Throwable $e) {
            Log::error('Erreur déconnexion', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue lors de la déconnexion.'], 500);
        }
    }

    public function refresh(Request $request)
    {
        try {
            $result = $this->authRepository->refresh();

            return response()->json([
                'access_token' => $result['token'],
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
            ]);
        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token expiré, veuillez vous reconnecter'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token invalide'], 401);
        } catch (JWTException $e) {
            Log::error('Erreur refresh token', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Impossible de rafraîchir le token'], 500);
        } catch (Throwable $e) {
            Log::error('Erreur refresh', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $user = $this->authRepository->me();

            if (!$user) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            return response()->json(['user' => $user]);
        } catch (Throwable $e) {
            Log::error('Erreur récupération utilisateur', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            $request->validate(['email' => ['required', 'email']]);

            $status = $this->authRepository->sendPasswordResetLink($request->only('email'));

            return $status === Password::RESET_LINK_SENT
                ? response()->json(['message' => __($status)])
                : response()->json(['message' => __($status)], 400);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (Throwable $e) {
            Log::error('Erreur envoi lien réinitialisation', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => ['required'],
                'email' => ['required', 'email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $success = $this->authRepository->resetPassword($request->only(
                'email', 'password', 'password_confirmation', 'token'
            ));

            return $success
                ? response()->json(['message' => 'Mot de passe réinitialisé avec succès'])
                : response()->json(['message' => 'Jeton invalide ou expiré'], 400);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (Throwable $e) {
            Log::error('Erreur réinitialisation mot de passe', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        try {
            $verified = $this->authRepository->verifyEmail($id, $hash);

            if (!$verified) {
                return response()->json(['message' => 'Lien de vérification invalide.'], 400);
            }

            return response()->json(['message' => 'E-mail vérifié avec succès.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        } catch (Throwable $e) {
            Log::error('Erreur vérification e-mail', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function resendVerification(Request $request)
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return response()->json(['message' => 'L\'e-mail est déjà vérifié.'], 400);
            }

            $this->authRepository->resendVerificationEmail($request->user());

            return response()->json(['message' => 'Lien de vérification renvoyé.']);
        } catch (Throwable $e) {
            Log::error('Erreur renvoi vérification', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
}