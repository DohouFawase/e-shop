<?php

namespace App\Http\Controllers\Api\V1\Boutique\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreVisitController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'visitor_id' => ['required', 'uuid'],
            'page_path' => ['required', 'string', 'max:512'],
        ]);

        $visitedAt = now();
        $recentDuplicate = DB::table('store_visits')
            ->where('visitor_id', $data['visitor_id'])
            ->where('page_path', $data['page_path'])
            ->where('visited_at', '>=', $visitedAt->copy()->subSeconds(30))
            ->exists();

        if (!$recentDuplicate) {
            DB::table('store_visits')->insert([
                'id' => (string) Str::uuid(),
                'visitor_id' => $data['visitor_id'],
                'page_path' => $data['page_path'],
                'visited_at' => $visitedAt,
            ]);
        }

        return response()->json(['recorded' => true], 202);
    }
}
