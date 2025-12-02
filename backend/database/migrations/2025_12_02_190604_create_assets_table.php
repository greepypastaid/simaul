<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['WASHING_MACHINE', 'DRYER', 'IRON', 'EQUIPMENT', 'FURNITURE', 'VEHICLE', 'OTHER']);
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->decimal('purchase_price', 15, 2);
            $table->date('purchase_date');
            $table->integer('useful_life_months')->default(60);
            $table->decimal('depreciation_per_month', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->timestamps();
            
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
