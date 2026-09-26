<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_visits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('visitor_id');
            $table->string('page_path', 512);
            $table->timestamp('visited_at')->useCurrent();
            $table->index(['visited_at', 'visitor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_visits');
    }
};
