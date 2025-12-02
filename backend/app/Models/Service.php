<?php

namespace App\Models;

use App\Enums\UnitType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'price',
        'unit_type',
        'estimated_duration_hours',
        'is_express_available',
        'express_multiplier',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'express_multiplier' => 'decimal:2',
            'estimated_duration_hours' => 'integer',
            'is_express_available' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'unit_type' => UnitType::class,
        ];
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'service_materials')
            ->withPivot('quantity_needed', 'notes')
            ->withTimestamps();
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function calculatePrice(float $qty, bool $isExpress = false): float
    {
        $basePrice = $this->price * $qty;
        
        return match (true) {
            $isExpress && $this->is_express_available => $basePrice * $this->express_multiplier,
            default => $basePrice,
        };
    }

    public function getRecipe(): array
    {
        return $this->materials()
            ->get()
            ->mapWithKeys(fn ($material) => [
                $material->id => $material->pivot->quantity_needed
            ])
            ->toArray();
    }
}
