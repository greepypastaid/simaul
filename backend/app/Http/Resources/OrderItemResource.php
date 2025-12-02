<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_id' => $this->service_id,
            'service' => $this->when(
                $this->relationLoaded('service'),
                fn () => [
                    'id' => $this->service->id,
                    'name' => $this->service->name,
                    'code' => $this->service->code,
                    'unit_type' => $this->service->unit_type,
                ]
            ),
            'qty' => (float) $this->qty,
            'price_at_moment' => (float) $this->price_at_moment,
            'subtotal' => (float) $this->subtotal,
            'formatted_subtotal' => 'Rp ' . number_format($this->subtotal, 0, ',', '.'),
            'is_express' => $this->is_express,
            'express_multiplier' => (float) $this->express_multiplier,
            'notes' => $this->notes,
        ];
    }
}
