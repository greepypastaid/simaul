<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')
                ->constrained('services')
                ->onDelete('cascade');
            $table->foreignId('material_id')
                ->constrained('materials')
                ->onDelete('cascade');
            $table->decimal('quantity_needed', 10, 3);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['service_id', 'material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_materials');
    }
};
