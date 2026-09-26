<?php

namespace App\Models\Boutique;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    //
    
      use HasUuids;

    protected $fillable = ['cart_id', 'product_id', 'quantity'];

   protected $appends = ['subtotal'];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getSubtotalAttribute()
    {
        return $this->product ? $this->product->price * $this->quantity : 0;
    }
}
