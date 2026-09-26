<?php

namespace App\Http\Controllers\Api\V1\Boutique\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Boutique\Order;
use App\Models\Boutique\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardStatsController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:day,week,month'],
        ]);
        $period = $validated['period'] ?? 'week';
        $now = now();

        if ($period === 'day') {
            $start = $now->copy()->startOfDay();
            $bucketExpression = 'HOUR(created_at)';
            $points = collect(range(0, 23))->map(fn ($hour) => [
                'key' => (string) $hour,
                'label' => sprintf('%02d:00', $hour),
            ]);
        } elseif ($period === 'month') {
            $start = $now->copy()->startOfMonth();
            $bucketExpression = 'DATE(created_at)';
            $points = collect(range(1, $now->daysInMonth))->map(fn ($day) => [
                'key' => $start->copy()->day($day)->toDateString(),
                'label' => (string) $day,
            ]);
        } else {
            $start = $now->copy()->startOfWeek(Carbon::MONDAY);
            $bucketExpression = 'DATE(created_at)';
            $points = collect(range(0, 6))->map(fn ($offset) => [
                'key' => $start->copy()->addDays($offset)->toDateString(),
                'label' => $start->copy()->addDays($offset)->translatedFormat('D j'),
            ]);
        }

        if ($period === 'day') {
            $previousStart = $start->copy()->subDay();
        } elseif ($period === 'month') {
            $previousStart = $start->copy()->subMonth()->startOfMonth();
        } else {
            $previousStart = $start->copy()->subWeek();
        }
        $previousEnd = $start->copy()->subMicrosecond();

        $customerBuckets = DB::table('users')
            ->where('is_admin', false)
            ->whereBetween('created_at', [$start, $now])
            ->selectRaw("{$bucketExpression} as bucket, COUNT(*) as total")
            ->groupBy('bucket')
            ->pluck('total', 'bucket');

        $visitBucketExpression = $period === 'day' ? 'HOUR(visited_at)' : 'DATE(visited_at)';
        $visitBuckets = DB::table('store_visits')
            ->whereBetween('visited_at', [$start, $now])
            ->selectRaw("{$visitBucketExpression} as bucket, COUNT(DISTINCT visitor_id) as visitors, COUNT(*) as page_views")
            ->groupBy('bucket')
            ->get()
            ->keyBy(fn ($row) => (string) $row->bucket);

        $conversionBucketExpression = $period === 'day' ? 'HOUR(created_at)' : 'DATE(created_at)';
        $conversionBuckets = DB::table('orders')
            ->whereBetween('created_at', [$start, $now])
            ->whereNotNull('analytics_visitor_id')
            ->where('status', '!=', 'cancelled')
            ->selectRaw("{$conversionBucketExpression} as bucket, COUNT(DISTINCT analytics_visitor_id) as conversions")
            ->groupBy('bucket')
            ->get()
            ->keyBy(fn ($row) => (string) $row->bucket);

        $orderBuckets = DB::table('orders')
            ->whereBetween('created_at', [$start, $now])
            ->selectRaw("{$bucketExpression} as bucket, COUNT(*) as total_orders, SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as revenue, SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) as revenue_orders")
            ->groupBy('bucket')
            ->get()
            ->keyBy(fn ($row) => (string) $row->bucket);

        $series = $points->map(function ($point) use ($customerBuckets, $orderBuckets, $visitBuckets, $conversionBuckets) {
            $orders = $orderBuckets->get($point['key']);
            $visits = $visitBuckets->get($point['key']);
            $conversion = $conversionBuckets->get($point['key']);
            $conversions = (int) ($conversion->conversions ?? 0);
            $visitors = (int) ($visits->visitors ?? 0);
            return [
                'label' => $point['label'],
                'customers' => (int) ($customerBuckets->get($point['key']) ?? 0),
                'orders' => (int) ($orders->total_orders ?? 0),
                'revenue' => (float) ($orders->revenue ?? 0),
                'visits' => $visitors,
                'page_views' => (int) ($visits->page_views ?? 0),
                'conversions' => $conversions,
                'conversion_rate' => $visitors > 0 ? round(($conversions / $visitors) * 100, 2) : 0,
            ];
        })->values();

        $statusCounts = Order::query()
            ->whereBetween('created_at', [$start, $now])
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $orderCount = (int) $series->sum('orders');
        $revenue = (float) $series->sum('revenue');
        $revenueOrderCount = (int) $orderBuckets->sum('revenue_orders');

        $previousCustomers = User::where('is_admin', false)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();
        $previousVisitors = DB::table('store_visits')
            ->whereBetween('visited_at', [$previousStart, $previousEnd])
            ->distinct()
            ->count('visitor_id');
        $previousConversions = DB::table('orders')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->whereNotNull('analytics_visitor_id')
            ->where('status', '!=', 'cancelled')
            ->distinct()
            ->count('analytics_visitor_id');
        $pageViews = (int) $series->sum('page_views');
        $uniqueVisitors = DB::table('store_visits')
            ->whereBetween('visited_at', [$start, $now])
            ->distinct()
            ->count('visitor_id');
        $conversions = DB::table('orders')
            ->whereBetween('created_at', [$start, $now])
            ->whereNotNull('analytics_visitor_id')
            ->where('status', '!=', 'cancelled')
            ->distinct()
            ->count('analytics_visitor_id');

        $previousOrders = DB::table('orders')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->selectRaw("COUNT(*) as total_orders, SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as revenue, SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) as revenue_orders")
            ->first();

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $now])
            ->where('orders.status', '!=', 'cancelled')
            ->select('order_items.product_id', 'order_items.product_name')
            ->selectRaw('SUM(order_items.quantity) as units_sold, SUM(order_items.subtotal) as revenue')
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('units_sold')
            ->limit(5)
            ->get();

        $lowStockProducts = Product::with('category:id,name')
            ->where('is_active', true)
            ->where('stock_quantity', '<=', 5)
            ->orderBy('stock_quantity')
            ->limit(6)
            ->get(['id', 'name', 'category_id', 'stock_quantity']);

        $recentOrders = Order::query()
            ->with(['user:id,first_name,last_name,email'])
            ->withCount('items')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get(['id', 'user_id', 'status', 'total', 'created_at']);

        return response()->json([
            'period' => $period,
            'summary' => [
                'customers_total' => User::where('is_admin', false)->count(),
                'customers_new_period' => (int) $series->sum('customers'),
                'visits_period' => $uniqueVisitors,
                'page_views_period' => $pageViews,
                'conversions_period' => $conversions,
                'conversion_rate' => $uniqueVisitors > 0 ? round(($conversions / $uniqueVisitors) * 100, 2) : 0,
                'products_active' => Product::where('is_active', true)->count(),
                'orders_period' => $orderCount,
                'revenue_period' => $revenue,
                'average_order_value' => $revenueOrderCount > 0 ? $revenue / $revenueOrderCount : 0,
            ],
            'previous' => [
                'customers_new_period' => $previousCustomers,
                'visits_period' => $previousVisitors,
                'conversions_period' => $previousConversions,
                'conversion_rate' => $previousVisitors > 0 ? round(($previousConversions / $previousVisitors) * 100, 2) : 0,
                'orders_period' => (int) ($previousOrders->total_orders ?? 0),
                'revenue_period' => (float) ($previousOrders->revenue ?? 0),
            ],
            'series' => $series,
            'statuses' => $statusCounts,
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
            'recent_orders' => $recentOrders,
        ]);
    }
}
