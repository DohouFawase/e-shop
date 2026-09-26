<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['notifiable_type', 'notifiable_id']);
            $table->uuid('notifiable_id')->change();
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down(): void
    {
        if (DB::table('notifications')->exists()) {
            throw new \RuntimeException(
                'Cannot restore numeric notification owners while UUID notifications exist.'
            );
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['notifiable_type', 'notifiable_id']);
            $table->unsignedBigInteger('notifiable_id')->change();
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }
};
