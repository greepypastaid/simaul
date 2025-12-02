<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku', 50)->unique();
            $table->text('description')->nullable();
            $table->decimal('stock_qty', 12, 3)->default(0);
            $table->string('unit', 20);
            $table->decimal('cost_per_unit', 12, 2)->default(0);
            $table->unsignedInteger('min_stock_alert')->default(100);
            $table->string('supplier')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('sku');
            $table->index('stock_qty');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
