<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'total_points' => $this->total_points,
            'total_orders' => $this->total_orders,
            'total_spent' => (float) $this->total_spent,
            'last_order_date' => $this->last_order_date?->toISOString(),
            'notes' => $this->when($request->user(), $this->notes),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
