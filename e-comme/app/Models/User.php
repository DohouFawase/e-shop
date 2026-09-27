<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;
use Tymon\JWTAuth\Contracts\JWTSubject;

#[Fillable(['email', 'password', 'first_name', 'last_name', 'phone', 'location', 'timezone', 'terms_accepted_at', 'terms_version', 'privacy_notice_acknowledged_at', 'privacy_version'])]
#[Hidden(['password', 'remember_token', 'is_admin'])]
class User extends Authenticatable implements \Illuminate\Contracts\Auth\MustVerifyEmail, JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasUuids, HasPushSubscriptions;

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'privacy_notice_acknowledged_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function favorites()
    {
        return $this->hasMany(\App\Models\Boutique\Favorite::class);
    }

    public function orders()
    {
        return $this->hasMany(\App\Models\Boutique\Order::class);
    }
}
