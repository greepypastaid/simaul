<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'description' => $this->description,
            'stock_qty' => (float) $this->stock_qty,
            'unit' => $this->unit,
            'cost_per_unit' => (float) $this->cost_per_unit,
            'min_stock_alert' => $this->min_stock_alert,
            'is_low_stock' => $this->isLowStock(),
            'supplier' => $this->supplier,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
