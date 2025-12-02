<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')
                ->constrained('customers')
                ->onDelete('restrict');
            $table->string('tracking_code', 10)->unique();
            $table->decimal('total_price', 15, 2)->default(0);
            $table->decimal('weight_qty', 8, 3)->nullable();
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('final_price', 15, 2)->default(0);
            $table->datetime('pickup_date')->nullable();
            $table->datetime('estimated_completion')->nullable();
            $table->datetime('actual_completion')->nullable();
            $table->enum('status', [
                'BOOKED',
                'PENDING',
                'WASHING',
                'DRYING',
                'IRONING',
                'COMPLETED',
                'TAKEN',
                'CANCELLED'
            ])->default('BOOKED');
            $table->enum('payment_status', [
                'UNPAID',
                'PARTIAL',
                'PAID'
            ])->default('UNPAID');
            $table->enum('payment_method', [
                'CASH',
                'TRANSFER',
                'QRIS',
                'OTHER'
            ])->nullable();
            $table->boolean('is_express')->default(false);
            $table->unsignedInteger('points_earned')->default(0);
            $table->unsignedInteger('points_used')->default(0);
            $table->text('customer_notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->foreignId('created_by')->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->foreignId('updated_by')->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index('tracking_code');
            $table->index('status');
            $table->index('payment_status');
            $table->index('pickup_date');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
