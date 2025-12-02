<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'previous_status' => $this->previous_status,
            'action' => $this->action,
            'notes' => $this->notes,
            'created_by' => $this->when(
                $this->relationLoaded('creator') && $this->creator,
                fn () => $this->creator->name
            ),
            'created_at' => $this->created_at->toISOString(),
            'formatted_date' => $this->created_at->format('d M Y H:i'),
        ];
    }
}
