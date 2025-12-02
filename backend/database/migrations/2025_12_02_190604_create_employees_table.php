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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('position', ['WASHER', 'IRONER', 'PACKER', 'DELIVERY', 'HELPER']);
            $table->string('phone');
            $table->text('address')->nullable();
            $table->date('join_date');
            $table->decimal('base_salary', 15, 2);
            $table->string('status')->default('ACTIVE');
            $table->timestamps();
            
            $table->index(['status', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
