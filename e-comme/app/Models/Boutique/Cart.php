<?php

namespace App\Models\Boutique;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    //
     use HasUuids;

    
    protected $fillable = ['user_id'];

    protected function casts(): array
    {
        return ['abandoned_reminder_sent_at' => 'datetime'];
    }

    protected $appends = ['total'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function getTotalAttribute()
    {
        return $this->items->sum(fn ($item) => $item->product->price * $item->quantity);
    }
}
