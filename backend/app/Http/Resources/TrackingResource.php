<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrackingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'tracking_code' => $this->tracking_code,
            'customer_name' => $this->customer->name,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'payment_status' => $this->payment_status,
            'pickup_date' => $this->pickup_date?->format('d M Y H:i'),
            'estimated_completion' => $this->estimated_completion?->format('d M Y H:i'),
            'total_items' => $this->items->count(),
            'services' => $this->items->map(fn ($item) => [
                'name' => $item->service->name,
                'qty' => (float) $item->qty,
                'unit' => $item->service->unit_type,
            ]),
            'final_price' => 'Rp ' . number_format($this->final_price, 0, ',', '.'),
            'timeline' => $this->histories
                ->where('action', 'STATUS_CHANGE')
                ->sortBy('created_at')
                ->values()
                ->map(fn ($h) => [
                    'status' => $h->status,
                    'status_label' => $h->getStatusLabel(),
                    'date' => $h->created_at->format('d M Y'),
                    'time' => $h->created_at->format('H:i'),
                    'notes' => $h->notes,
                ]),
            'created_at' => $this->created_at->format('d M Y H:i'),
        ];
    }
}
