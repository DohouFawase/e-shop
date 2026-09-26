<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::firstOrCreate(
            ['email' => 'dohfawaz90@gmail.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'Système',
                'phone' => '0100000000',
                // 'location' => 'Cotonou',
                'password' => Hash::make('Admin1234'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
