<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsCustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->is_admin) {
            return response()->json(['message' => 'Les administrateurs ne peuvent pas effectuer d’achat sur la boutique.'], 403);
        }

        return $next($request);
    }
}
