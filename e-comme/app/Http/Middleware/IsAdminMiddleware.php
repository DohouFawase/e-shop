<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
class IsAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
         try {
            // Récupère l'utilisateur à partir du token JWT
            $user = JWTAuth::parseToken()->authenticate();

            if (! $user) {
                return response()->json(['message' => 'Utilisateur introuvable.'], 401);
            }

            // Vérifie s'il est admin
            if (! $user->is_admin) {
                return response()->json(['message' => 'Accès non autorisé. Réservé aux administrateurs.'], 403);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 401);
        }
        return $next($request);
    }
}
