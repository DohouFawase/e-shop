<?php

namespace App\Models\Boutique;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $hidden = ['payment_authorization_url'];
    //

    use HasUuids;

    protected $fillable = [
        'user_id', 'analytics_visitor_id', 'status', 'total', 'shipping_address', 'phone', 'notes',
        'payment_method', 'payment_status', 'payment_provider', 'payment_reference',
        'payment_authorization_url', 'provider_transaction_id', 'paid_at', 'sales_terms_accepted_at', 'sales_terms_version',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'paid_at' => 'datetime',
            'sales_terms_accepted_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
