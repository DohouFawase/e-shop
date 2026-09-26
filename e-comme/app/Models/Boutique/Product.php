<?php

namespace App\Models\Boutique;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasUuids;

    protected $fillable = [
        'category_id',
        'producer_id',
        'name',
        'description',
        'price',
        'unit',
        'stock_quantity',
        'images',
        'is_active',
        'discount_price',
        'discount_starts_at',
        'discount_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'is_active' => 'boolean',
            'discount_starts_at' => 'datetime',
            'discount_ends_at' => 'datetime',
        ];
    }


    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function producer()
    {
        return $this->belongsTo(User::class, 'producer_id');
    }

    protected $appends = ['final_price', 'is_on_discount', 'average_rating', 'reviews_count'];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getAverageRatingAttribute()
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function getReviewsCountAttribute()
    {
        return $this->reviews()->count();
    }

    public function getIsOnDiscountAttribute(): bool
    {
        if (!$this->discount_price) {
            return false;
        }

        $now = now();

        $startsOk = !$this->discount_starts_at || $now->gte($this->discount_starts_at);
        $endsOk = !$this->discount_ends_at || $now->lte($this->discount_ends_at->copy()->endOfDay());

        return $startsOk && $endsOk;
    }

    public function getFinalPriceAttribute()
    {
        return $this->is_on_discount ? $this->discount_price : $this->price;
    }
}
