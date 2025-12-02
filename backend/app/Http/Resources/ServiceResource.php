<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'price' => (float) $this->price,
            'formatted_price' => 'Rp ' . number_format($this->price, 0, ',', '.'),
            'unit_type' => $this->unit_type,
            'estimated_duration_hours' => $this->estimated_duration_hours,
            'is_express_available' => $this->is_express_available,
            'express_multiplier' => (float) $this->express_multiplier,
            'is_active' => $this->is_active,
            
            'materials' => $this->when(
                $this->relationLoaded('materials'),
                fn () => $this->materials->map(fn ($m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'unit' => $m->unit,
                    'quantity_needed' => (float) $m->pivot->quantity_needed,
                ])
            ),
        ];
    }
}
