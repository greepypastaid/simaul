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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['OPERATIONAL', 'UTILITY', 'MAINTENANCE', 'SALARY', 'MARKETING', 'INVENTORY', 'OTHER']);
            $table->enum('payment_type', ['CASH', 'TRANSFER']);
            $table->decimal('amount', 15, 2);
            $table->string('description');
            $table->text('notes')->nullable();
            $table->date('expense_date');
            $table->string('receipt_path')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index(['expense_date', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
