<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Expand the enum to include READY status
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('BOOKED', 'PENDING', 'WASHING', 'DRYING', 'IRONING', 'COMPLETED', 'READY', 'TAKEN', 'CANCELLED') NOT NULL DEFAULT 'BOOKED'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove READY status from enum
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('BOOKED', 'PENDING', 'WASHING', 'DRYING', 'IRONING', 'COMPLETED', 'TAKEN', 'CANCELLED') NOT NULL DEFAULT 'BOOKED'");
    }
};
