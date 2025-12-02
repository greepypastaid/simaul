<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')
                ->constrained('materials')
                ->onDelete('cascade');
            $table->enum('type', ['IN', 'OUT', 'ADJUSTMENT', 'RETURN']);
            $table->decimal('quantity', 12, 3);
            $table->decimal('stock_before', 12, 3);
            $table->decimal('stock_after', 12, 3);
            $table->foreignId('order_id')->nullable()
                ->constrained('orders')
                ->onDelete('set null');
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->timestamps();

            $table->index('material_id');
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_stock_movements');
    }
};
