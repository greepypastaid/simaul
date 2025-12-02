<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->when($request->user(), $this->id),
            'tracking_code' => $this->tracking_code,
            'customer' => $this->when(
                $this->relationLoaded('customer'),
                fn () => new CustomerResource($this->customer)
            ),
            'total_price' => (float) $this->total_price,
            'formatted_total_price' => 'Rp ' . number_format($this->total_price, 0, ',', '.'),
            'weight_qty' => $this->weight_qty ? (float) $this->weight_qty : null,
            'discount_amount' => (float) $this->discount_amount,
            'final_price' => (float) $this->final_price,
            'formatted_final_price' => 'Rp ' . number_format($this->final_price, 0, ',', '.'),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'pickup_date' => $this->pickup_date?->toISOString(),
            'formatted_pickup_date' => $this->pickup_date?->format('d M Y H:i'),
            'estimated_completion' => $this->estimated_completion?->toISOString(),
            'actual_completion' => $this->actual_completion?->toISOString(),
            'is_express' => $this->is_express,
            'points_earned' => $this->points_earned,
            'points_used' => $this->points_used,
            'customer_notes' => $this->customer_notes,
            'internal_notes' => $this->when($request->user(), $this->internal_notes),
            'items' => $this->when(
                $this->relationLoaded('items'),
                fn () => OrderItemResource::collection($this->items)
            ),
            'histories' => $this->when(
                $this->relationLoaded('histories'),
                fn () => OrderHistoryResource::collection($this->histories)
            ),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
