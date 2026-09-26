<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->where('payment_method', 'paystack')
            ->where('payment_status', '!=', 'paid')
            ->update([
                'payment_method' => 'cinetpay',
                'payment_status' => 'failed',
                'payment_provider' => 'cinetpay',
                'payment_reference' => null,
                'payment_authorization_url' => null,
            ]);

        DB::table('orders')
            ->where('payment_method', 'paystack')
            ->where('payment_status', 'paid')
            ->update(['payment_method' => 'cinetpay']);
    }

    public function down(): void
    {
        // Payment references cannot be safely restored after new CinetPay transactions exist.
    }
};
