<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 20)->unique();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('total_orders')->default(0);
            $table->decimal('total_spent', 15, 2)->default(0);
            $table->timestamp('last_order_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('phone');
            $table->index('last_order_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
