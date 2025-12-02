<?php

namespace App\Models;

use App\Enums\StockMovementType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Material extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'stock_qty',
        'unit',
        'cost_per_unit',
        'min_stock_alert',
        'supplier',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'stock_qty' => 'decimal:3',
            'cost_per_unit' => 'decimal:2',
            'min_stock_alert' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getCurrentStockAttribute(): float
    {
        return (float) $this->stock_qty;
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'service_materials')
            ->withPivot('quantity_needed', 'notes')
            ->withTimestamps();
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(MaterialStockMovement::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock_qty', '<=', 'min_stock_alert');
    }

    public function hasEnoughStock(float $quantity): bool
    {
        return $this->stock_qty >= $quantity;
    }

    public function isLowStock(): bool
    {
        return $this->stock_qty <= $this->min_stock_alert;
    }

    public function deductStock(
        float $quantity,
        ?int $orderId = null,
        ?int $userId = null,
        ?string $notes = null
    ): MaterialStockMovement {
        $stockBefore = $this->stock_qty;
        $this->decrement('stock_qty', $quantity);

        return $this->stockMovements()->create([
            'type' => StockMovementType::OUT,
            'quantity' => -$quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $this->fresh()->stock_qty,
            'order_id' => $orderId,
            'notes' => $notes,
            'created_by' => $userId,
        ]);
    }

    public function addStock(
        float $quantity,
        StockMovementType $type = StockMovementType::IN,
        ?int $userId = null,
        ?string $notes = null
    ): MaterialStockMovement {
        $stockBefore = $this->stock_qty;
        $this->increment('stock_qty', $quantity);

        return $this->stockMovements()->create([
            'type' => $type,
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $this->fresh()->stock_qty,
            'notes' => $notes,
            'created_by' => $userId,
        ]);
    }
}
