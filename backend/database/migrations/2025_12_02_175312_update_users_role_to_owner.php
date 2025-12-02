<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update all existing users to OWNER role and change enum values
     */
    public function up(): void
    {
        // First, expand enum to include OWNER
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'STAFF', 'CASHIER', 'OWNER') DEFAULT 'OWNER'");
        
        // Update all existing users to OWNER role
        DB::statement("UPDATE users SET role = 'OWNER' WHERE role IN ('ADMIN', 'STAFF', 'CASHIER')");
        
        // Now change the enum to only have OWNER
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('OWNER') DEFAULT 'OWNER'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore original enum values (include all old values first)
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'STAFF', 'CASHIER', 'OWNER') DEFAULT 'STAFF'");
        
        // Set existing users back to ADMIN
        DB::statement("UPDATE users SET role = 'ADMIN' WHERE role = 'OWNER'");
        
        // Remove OWNER from enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'STAFF', 'CASHIER') DEFAULT 'STAFF'");
    }
};
