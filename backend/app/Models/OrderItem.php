<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'service_id',
        'qty',
        'price_at_moment',
        'subtotal',
        'is_express',
        'express_multiplier',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'decimal:3',
            'price_at_moment' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'express_multiplier' => 'decimal:2',
            'is_express' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function calculateSubtotal(): float
    {
        $basePrice = $this->price_at_moment * $this->qty;

        return match ($this->is_express) {
            true => $basePrice * $this->express_multiplier,
            default => $basePrice,
        };
    }

    public function getMaterialRequirements(): array
    {
        $requirements = [];
        $serviceMaterials = ServiceMaterial::where('service_id', $this->service_id)->get();

        foreach ($serviceMaterials as $sm) {
            $totalNeeded = $sm->quantity_needed * $this->qty;

            $requirements[$sm->material_id] = ($requirements[$sm->material_id] ?? 0) + $totalNeeded;
        }

        return $requirements;
    }
}
