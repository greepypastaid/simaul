<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\ServiceMaterial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsers();
        $this->seedMaterials();
        $this->seedServices();
        $this->seedCustomers();
        $this->seedSampleOrders();

        $this->command->info('Database seeded successfully!');
    }

    private function seedUsers(): void
    {
        User::create([
            'name' => 'Admin SIMAUL',
            'email' => 'admin@simaul.test',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Staff Kasir',
            'email' => 'kasir@simaul.test',
            'password' => Hash::make('password'),
            'role' => UserRole::STAFF,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Staff Operasional',
            'email' => 'operasional@simaul.test',
            'password' => Hash::make('password'),
            'role' => UserRole::STAFF,
            'is_active' => true,
        ]);

        $this->command->info('✓ Users seeded');
    }

    private function seedMaterials(): void
    {
        $materials = [
            ['name' => 'Deterjen Bubuk', 'sku' => 'MAT-DTRGN01', 'unit' => 'gram', 'stock_qty' => 5000, 'min_stock_alert' => 1000, 'cost_per_unit' => 50],
            ['name' => 'Pewangi Cair', 'sku' => 'MAT-PWANG01', 'unit' => 'ml', 'stock_qty' => 3000, 'min_stock_alert' => 500, 'cost_per_unit' => 30],
            ['name' => 'Pelembut Pakaian', 'sku' => 'MAT-PLMBT01', 'unit' => 'ml', 'stock_qty' => 2000, 'min_stock_alert' => 400, 'cost_per_unit' => 40],
            ['name' => 'Pemutih', 'sku' => 'MAT-PMTIH01', 'unit' => 'ml', 'stock_qty' => 1000, 'min_stock_alert' => 200, 'cost_per_unit' => 35],
            ['name' => 'Penghilang Noda', 'sku' => 'MAT-PHNDA01', 'unit' => 'ml', 'stock_qty' => 800, 'min_stock_alert' => 150, 'cost_per_unit' => 60],
            ['name' => 'Plastik Kemasan', 'sku' => 'MAT-PLSTK01', 'unit' => 'pcs', 'stock_qty' => 500, 'min_stock_alert' => 100, 'cost_per_unit' => 500],
            ['name' => 'Hanger', 'sku' => 'MAT-HNGR01', 'unit' => 'pcs', 'stock_qty' => 200, 'min_stock_alert' => 50, 'cost_per_unit' => 1500],
        ];

        foreach ($materials as $material) {
            Material::create([...$material, 'is_active' => true]);
        }

        $this->command->info('✓ Materials seeded');
    }

    private function seedServices(): void
    {
        $cuciKering = Service::create([
            'name' => 'Cuci Kering Regular',
            'code' => 'CK',
            'description' => 'Layanan cuci dan pengeringan standar untuk pakaian sehari-hari',
            'unit_type' => 'KG',
            'price' => 7000,
            'is_express_available' => true,
            'express_multiplier' => 1.71,
            'estimated_duration_hours' => 48,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $cuciSetrika = Service::create([
            'name' => 'Cuci Setrika',
            'code' => 'CS',
            'description' => 'Layanan cuci, kering, dan setrika untuk hasil rapi maksimal',
            'unit_type' => 'KG',
            'price' => 10000,
            'is_express_available' => true,
            'express_multiplier' => 1.70,
            'estimated_duration_hours' => 72,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $setrikaOnly = Service::create([
            'name' => 'Setrika Only',
            'code' => 'SO',
            'description' => 'Layanan setrika saja untuk pakaian yang sudah bersih',
            'unit_type' => 'KG',
            'price' => 5000,
            'is_express_available' => true,
            'express_multiplier' => 1.60,
            'estimated_duration_hours' => 24,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $dryClean = Service::create([
            'name' => 'Dry Clean',
            'code' => 'DC',
            'description' => 'Layanan dry clean untuk pakaian berbahan khusus (jas, kebaya, dll)',
            'unit_type' => 'PCS',
            'price' => 25000,
            'is_express_available' => true,
            'express_multiplier' => 1.60,
            'estimated_duration_hours' => 72,
            'is_active' => true,
            'sort_order' => 4,
        ]);

        $cuciSepatu = Service::create([
            'name' => 'Cuci Sepatu',
            'code' => 'CSPT',
            'description' => 'Layanan cuci sepatu sneakers, canvas, dll',
            'unit_type' => 'PCS',
            'price' => 30000,
            'is_express_available' => true,
            'express_multiplier' => 1.67,
            'estimated_duration_hours' => 48,
            'is_active' => true,
            'sort_order' => 5,
        ]);

        $cuciBedCover = Service::create([
            'name' => 'Cuci Bed Cover',
            'code' => 'CBC',
            'description' => 'Layanan cuci sprei dan bed cover',
            'unit_type' => 'PCS',
            'price' => 35000,
            'is_express_available' => true,
            'express_multiplier' => 1.57,
            'estimated_duration_hours' => 48,
            'is_active' => true,
            'sort_order' => 6,
        ]);

        $deterjen = Material::where('name', 'Deterjen Bubuk')->first();
        $pewangi = Material::where('name', 'Pewangi Cair')->first();
        $pelembut = Material::where('name', 'Pelembut Pakaian')->first();
        $plastik = Material::where('name', 'Plastik Kemasan')->first();
        $penghilangNoda = Material::where('name', 'Penghilang Noda')->first();

        ServiceMaterial::create(['service_id' => $cuciKering->id, 'material_id' => $deterjen->id, 'quantity_needed' => 50]);
        ServiceMaterial::create(['service_id' => $cuciKering->id, 'material_id' => $pewangi->id, 'quantity_needed' => 20]);

        ServiceMaterial::create(['service_id' => $cuciSetrika->id, 'material_id' => $deterjen->id, 'quantity_needed' => 50]);
        ServiceMaterial::create(['service_id' => $cuciSetrika->id, 'material_id' => $pewangi->id, 'quantity_needed' => 20]);
        ServiceMaterial::create(['service_id' => $cuciSetrika->id, 'material_id' => $pelembut->id, 'quantity_needed' => 15]);

        ServiceMaterial::create(['service_id' => $dryClean->id, 'material_id' => $penghilangNoda->id, 'quantity_needed' => 10]);
        ServiceMaterial::create(['service_id' => $dryClean->id, 'material_id' => $plastik->id, 'quantity_needed' => 1]);

        ServiceMaterial::create(['service_id' => $cuciSepatu->id, 'material_id' => $deterjen->id, 'quantity_needed' => 30]);
        ServiceMaterial::create(['service_id' => $cuciSepatu->id, 'material_id' => $penghilangNoda->id, 'quantity_needed' => 5]);

        ServiceMaterial::create(['service_id' => $cuciBedCover->id, 'material_id' => $deterjen->id, 'quantity_needed' => 100]);
        ServiceMaterial::create(['service_id' => $cuciBedCover->id, 'material_id' => $pewangi->id, 'quantity_needed' => 30]);

        $this->command->info('✓ Services with BOM seeded');
    }

    private function seedCustomers(): void
    {
        $customers = [
            ['name' => 'Budi Santoso', 'phone' => '081234567890', 'email' => 'budi@email.com', 'address' => 'Jl. Merdeka No. 123'],
            ['name' => 'Siti Rahayu', 'phone' => '081234567891', 'email' => 'siti@email.com', 'address' => 'Jl. Sudirman No. 45'],
            ['name' => 'Ahmad Wijaya', 'phone' => '081234567892', 'email' => null, 'address' => 'Jl. Gatot Subroto No. 78'],
            ['name' => 'Dewi Lestari', 'phone' => '081234567893', 'email' => 'dewi@email.com', 'address' => null],
            ['name' => 'Rudi Hartono', 'phone' => '081234567894', 'email' => null, 'address' => 'Jl. Asia Afrika No. 99'],
        ];

        foreach ($customers as $customer) {
            Customer::create([...$customer, 'total_points' => rand(0, 100)]);
        }

        $this->command->info('✓ Customers seeded');
    }

    private function seedSampleOrders(): void
    {
        $customers = Customer::all();
        $services = Service::all();
        $admin = User::where('role', UserRole::ADMIN)->first();

        $statuses = [
            OrderStatus::BOOKED,
            OrderStatus::PENDING,
            OrderStatus::WASHING,
            OrderStatus::COMPLETED,
            OrderStatus::TAKEN,
        ];

        foreach ($statuses as $index => $status) {
            $customer = $customers->random();
            $service = $services->random();
            $qty = rand(1, 10) + (rand(0, 9) / 10);
            $isExpress = rand(0, 1) === 1;
            $subtotal = $service->calculatePrice($qty, $isExpress);
            $trackingCode = strtoupper(Str::random(10));

            $isPaidStatus = in_array($status, [OrderStatus::COMPLETED, OrderStatus::TAKEN]);

            $order = Order::create([
                'tracking_code' => $trackingCode,
                'customer_id' => $customer->id,
                'status' => $status,
                'total_price' => $subtotal,
                'discount_amount' => 0,
                'final_price' => $subtotal,
                'is_express' => $isExpress,
                'points_used' => 0,
                'payment_status' => $isPaidStatus ? PaymentStatus::PAID : PaymentStatus::UNPAID,
                'payment_method' => $isPaidStatus ? PaymentMethod::CASH : null,
                'pickup_date' => now()->addDays(rand(1, 3)),
                'customer_notes' => 'Order sample untuk ' . $status->value,
                'created_by' => $status === OrderStatus::BOOKED ? null : $admin->id,
                'created_at' => now()->subDays($index),
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'service_id' => $service->id,
                'qty' => $qty,
                'price_at_moment' => $service->price,
                'is_express' => $isExpress,
                'express_multiplier' => $isExpress ? $service->express_multiplier : 1.00,
                'subtotal' => $subtotal,
            ]);

            OrderHistory::create([
                'order_id' => $order->id,
                'status' => $status,
                'action' => 'STATUS_CHANGE',
                'notes' => 'Order dibuat - ' . $status->value,
                'created_by' => $status === OrderStatus::BOOKED ? null : $admin->id,
            ]);
        }

        $this->command->info('✓ Sample orders seeded');
    }
}
