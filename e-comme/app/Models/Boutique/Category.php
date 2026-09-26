<?php

namespace App\Models\Boutique;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    //,
    use HasUuids;
 protected $fillable = ['name', 'description', 'image'];
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
