<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'material_id',
        'quantity_needed',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity_needed' => 'decimal:3',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function calculateMaterialNeeded(float $serviceQty): float
    {
        return $this->quantity_needed * $serviceQty;
    }
}
