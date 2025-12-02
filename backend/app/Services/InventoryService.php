<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\StockMovementType;
use App\Models\Material;
use App\Models\MaterialStockMovement;
use App\Models\Order;
use App\Models\ServiceMaterial;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function checkStockAvailability(Collection|array $items): array
    {
        $requiredMaterials = $this->calculateRequiredMaterials($items);
        $shortage = [];
        $sufficient = true;

        foreach ($requiredMaterials as $materialId => $needed) {
            $material = Material::find($materialId);

            if (!$material || $material->current_stock < $needed) {
                $sufficient = false;
                $shortage[] = [
                    'material_id' => $materialId,
                    'material_name' => $material?->name ?? 'Unknown',
                    'required' => $needed,
                    'available' => $material?->current_stock ?? 0,
                    'shortage' => $needed - ($material?->current_stock ?? 0),
                ];
            }
        }

        return [
            'sufficient' => $sufficient,
            'shortage' => $shortage,
            'required_materials' => $requiredMaterials,
        ];
    }

    public function calculateRequiredMaterials(Collection|array $items): array
    {
        $required = [];

        foreach ($items as $item) {
            $serviceId = is_array($item) ? $item['service_id'] : $item->service_id;
            $qty = is_array($item) ? $item['qty'] : $item->qty;

            $serviceMaterials = ServiceMaterial::where('service_id', $serviceId)->get();

            foreach ($serviceMaterials as $sm) {
                $totalNeeded = $qty * $sm->quantity_needed;
                $required[$sm->material_id] = ($required[$sm->material_id] ?? 0) + $totalNeeded;
            }
        }

        return $required;
    }

    public function deductStockForOrder(Order $order): void
    {
        $requiredMaterials = $this->calculateRequiredMaterials($order->items);

        foreach ($requiredMaterials as $materialId => $quantity) {
            $material = Material::lockForUpdate()->find($materialId);

            if (!$material) {
                throw new \Exception("Material ID {$materialId} tidak ditemukan");
            }

            if ($material->current_stock < $quantity) {
                throw new \Exception("Stok {$material->name} tidak mencukupi. Dibutuhkan: {$quantity}, Tersedia: {$material->current_stock}");
            }

            $stockBefore = $material->current_stock;
            $material->deductStock($quantity);

            MaterialStockMovement::create([
                'material_id' => $materialId,
                'order_id' => $order->id,
                'type' => StockMovementType::OUT,
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $material->current_stock,
                'notes' => "Pengurangan untuk Order #{$order->tracking_code}",
                'created_by' => auth()->id(),
            ]);
        }
    }

    public function restoreStockForOrder(Order $order): void
    {
        $movements = MaterialStockMovement::where('order_id', $order->id)
            ->where('type', StockMovementType::OUT)
            ->get();

        foreach ($movements as $movement) {
            $material = Material::lockForUpdate()->find($movement->material_id);

            if (!$material) {
                continue;
            }

            $stockBefore = $material->current_stock;
            $material->addStock($movement->quantity);

            MaterialStockMovement::create([
                'material_id' => $movement->material_id,
                'order_id' => $order->id,
                'type' => StockMovementType::IN,
                'quantity' => $movement->quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $material->current_stock,
                'notes' => "Pengembalian stok - Order #{$order->tracking_code} dibatalkan",
                'created_by' => auth()->id(),
            ]);
        }
    }

    public function addStock(
        Material $material,
        float $quantity,
        string $notes = '',
        ?int $createdBy = null
    ): MaterialStockMovement {
        $stockBefore = $material->current_stock;
        $material->addStock($quantity);

        return MaterialStockMovement::create([
            'material_id' => $material->id,
            'order_id' => null,
            'type' => StockMovementType::IN,
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $material->current_stock,
            'notes' => $notes ?: 'Penambahan stok manual',
            'created_by' => $createdBy ?? auth()->id(),
        ]);
    }

    public function adjustStock(
        Material $material,
        float $newStock,
        string $notes = '',
        ?int $createdBy = null
    ): MaterialStockMovement {
        $stockBefore = $material->stock_qty;
        $difference = $newStock - $stockBefore;

        $material->update(['stock_qty' => $newStock]);

        return MaterialStockMovement::create([
            'material_id' => $material->id,
            'order_id' => null,
            'type' => StockMovementType::ADJUSTMENT,
            'quantity' => abs($difference),
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'notes' => $notes ?: 'Penyesuaian stok',
            'created_by' => $createdBy ?? auth()->id(),
        ]);
    }

    public function getLowStockMaterials(): Collection
    {
        return Material::whereRaw('stock_qty <= min_stock_alert')
            ->where('is_active', true)
            ->get();
    }

    public function getStockStatus(): Collection
    {
        return Material::select([
            'id',
            'name',
            'unit',
            'stock_qty',
            'min_stock_alert',
            DB::raw('CASE WHEN stock_qty <= min_stock_alert THEN "LOW" ELSE "OK" END as status')
        ])
        ->where('is_active', true)
        ->orderBy('name')
        ->get();
    }

    public function getStockHistory(Material $material, int $limit = 50): Collection
    {
        return $material->stockMovements()
            ->with(['order', 'creator'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getProjectedStock(): array
    {
        $bookedOrders = Order::where('status', OrderStatus::BOOKED)
            ->with('items')
            ->get();

        $projected = [];
        $materials = Material::where('is_active', true)->get();

        foreach ($materials as $material) {
            $projected[$material->id] = [
                'material' => $material->name,
                'current_stock' => $material->current_stock,
                'reserved' => 0,
                'projected_available' => $material->current_stock,
            ];
        }

        return $projected;
    }
}
