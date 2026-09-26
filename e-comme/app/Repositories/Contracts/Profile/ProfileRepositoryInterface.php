<?php

namespace App\Repositories\Contracts\Profile;

use App\Models\User;

interface ProfileRepositoryInterface
{
    public function updateProfile(User $user, array $data): User;
    public function changePassword(User $user, array $data): bool;
    public function deleteAccount(User $user): bool;
}