<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->onDelete('cascade');
            $table->string('status', 20);
            $table->string('previous_status', 20)->nullable();
            $table->string('action', 50)->default('STATUS_CHANGE');
            $table->text('notes')->nullable();
            $table->boolean('notification_sent')->default(false);
            $table->timestamp('notification_sent_at')->nullable();
            $table->foreignId('created_by')->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->timestamps();

            $table->index('order_id');
            $table->index('created_at');
            $table->index(['order_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_histories');
    }
};
