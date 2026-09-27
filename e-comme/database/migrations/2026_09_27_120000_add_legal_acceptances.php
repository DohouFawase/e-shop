<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('terms_accepted_at')->nullable();
            $table->string('terms_version', 32)->nullable();
            $table->timestamp('privacy_notice_acknowledged_at')->nullable();
            $table->string('privacy_version', 32)->nullable();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('sales_terms_accepted_at')->nullable();
            $table->string('sales_terms_version', 32)->nullable();
        });

        Schema::table('contact_messages', function (Blueprint $table) {
            $table->timestamp('privacy_notice_acknowledged_at')->nullable();
            $table->string('privacy_version', 32)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', fn (Blueprint $table) => $table->dropColumn(['privacy_notice_acknowledged_at', 'privacy_version']));
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn(['sales_terms_accepted_at', 'sales_terms_version']));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['terms_accepted_at', 'terms_version', 'privacy_notice_acknowledged_at', 'privacy_version']));
    }
};
