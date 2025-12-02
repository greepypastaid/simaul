<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->onDelete('cascade');
            $table->foreignId('service_id')
                ->constrained('services')
                ->onDelete('restrict');
            $table->decimal('qty', 8, 3);
            $table->decimal('price_at_moment', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->boolean('is_express')->default(false);
            $table->decimal('express_multiplier', 3, 2)->default(1.00);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
