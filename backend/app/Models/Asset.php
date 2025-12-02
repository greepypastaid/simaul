<?php

namespace App\Models;

use App\Enums\AssetType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'brand',
        'model',
        'serial_number',
        'purchase_price',
        'purchase_date',
        'useful_life_months',
        'depreciation_per_month',
        'description',
        'status',
    ];

    protected $casts = [
        'type' => AssetType::class,
        'purchase_price' => 'decimal:2',
        'purchase_date' => 'date',
        'depreciation_per_month' => 'decimal:2',
        'useful_life_months' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($asset) {
            if (!$asset->depreciation_per_month) {
                $asset->depreciation_per_month = $asset->purchase_price / $asset->useful_life_months;
            }
        });
    }

    public function currentValue(): float
    {
        $monthsSincePurchase = now()->diffInMonths($this->purchase_date);
        $depreciation = min($monthsSincePurchase * $this->depreciation_per_month, $this->purchase_price);
        return max(0, $this->purchase_price - $depreciation);
    }
}
