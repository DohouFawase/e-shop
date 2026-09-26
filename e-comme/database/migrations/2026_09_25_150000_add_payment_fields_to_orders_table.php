<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method', 32)->default('cash_on_delivery')->after('status');
            $table->string('payment_status', 24)->default('unpaid')->after('payment_method');
            $table->string('payment_provider', 32)->nullable()->after('payment_status');
            $table->string('payment_reference', 100)->nullable()->unique()->after('payment_provider');
            $table->text('payment_authorization_url')->nullable()->after('payment_reference');
            $table->string('provider_transaction_id', 100)->nullable()->after('payment_reference');
            $table->timestamp('paid_at')->nullable()->after('provider_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['payment_reference']);
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'payment_provider',
                'payment_reference',
                'payment_authorization_url',
                'provider_transaction_id',
                'paid_at',
            ]);
        });
    }
};
