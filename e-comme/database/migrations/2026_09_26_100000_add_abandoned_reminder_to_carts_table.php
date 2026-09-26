<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table): void {
            $table->timestamp('abandoned_reminder_sent_at')->nullable()->after('updated_at');
            $table->index(['updated_at', 'abandoned_reminder_sent_at'], 'carts_abandoned_reminder_idx');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table): void {
            $table->dropIndex('carts_abandoned_reminder_idx');
            $table->dropColumn('abandoned_reminder_sent_at');
        });
    }
};
