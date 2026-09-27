<?php

namespace App\Models\Contact;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactMessage extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'email', 'subject', 'message', 'read_at', 'privacy_notice_acknowledged_at', 'privacy_version'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime', 'privacy_notice_acknowledged_at' => 'datetime'];
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ContactMessageReply::class)->orderBy('created_at');
    }
}
