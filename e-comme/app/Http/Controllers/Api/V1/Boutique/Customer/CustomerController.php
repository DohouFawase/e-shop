<?php

namespace App\Http\Controllers\Api\V1\Boutique\Customer;

use App\Http\Controllers\Controller;
use App\Models\Boutique\Order;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = min(100, max(1, (int) $request->query('per_page', 15)));

        return User::query()
            ->where('is_admin', false)
            ->select(['id', 'first_name', 'last_name', 'email', 'phone', 'created_at', 'email_verified_at', 'last_login_at'])
            ->withCount('orders')
            ->addSelect([
                'latest_order_status' => Order::query()
                    ->select('status')
                    ->whereColumn('orders.user_id', 'users.id')
                    ->orderByDesc('orders.created_at')
                    ->orderByDesc('orders.id')
                    ->limit(1),
                'latest_order_created_at' => Order::query()
                    ->select('created_at')
                    ->whereColumn('orders.user_id', 'users.id')
                    ->orderByDesc('orders.created_at')
                    ->orderByDesc('orders.id')
                    ->limit(1),
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function show(string $id)
    {
        $customer = User::query()
            ->where('is_admin', false)
            ->with(['orders' => fn ($query) => $query->with('items')->orderByDesc('created_at')])
            ->findOrFail($id);

        return response()->json(['customer' => $customer]);
    }
}
