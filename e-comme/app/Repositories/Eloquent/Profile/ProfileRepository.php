<?php

namespace App\Repositories\Eloquent\Profile;

use App\Models\User;
use App\Repositories\Contracts\Profile\ProfileRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class ProfileRepository implements ProfileRepositoryInterface
{
    public function updateProfile(User $user, array $data): User
    {
        $user->fill($data);
        $user->save();

        return $user->fresh();
    }

    public function changePassword(User $user, array $data): bool
    {
        if (! Hash::check($data['current_password'], $user->password)) {
            return false;
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
        ])->save();

        return true;
    }

    public function deleteAccount(User $user): bool
    {
        return (bool) $user->delete();
    }
}