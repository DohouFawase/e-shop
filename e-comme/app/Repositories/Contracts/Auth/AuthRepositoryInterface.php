<?php

namespace App\Repositories\Contracts\Auth;

use App\Models\User;

interface AuthRepositoryInterface
{
   public function register(array $data): array;
    public function login(array $credentials): ?array;
    public function logout(): void;
    public function refresh(): array;
    public function me(): ?User;
    public function sendPasswordResetLink(array $data): string;
    public function resetPassword(array $data): bool;
    public function verifyEmail(int $userId, string $hash): bool;
    public function resendVerificationEmail(User $user): void;
}