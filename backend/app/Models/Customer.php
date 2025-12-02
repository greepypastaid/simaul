<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'total_points',
        'total_orders',
        'total_spent',
        'last_order_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_points' => 'integer',
            'total_orders' => 'integer',
            'total_spent' => 'decimal:2',
            'last_order_date' => 'datetime',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeByPhone(Builder $query, string $phone): Builder
    {
        return $query->where('phone', $phone);
    }

    public function scopeInactive(Builder $query, int $days = 30): Builder
    {
        return $query->where('last_order_date', '<', now()->subDays($days))
            ->orWhereNull('last_order_date');
    }

    public static function calculatePoints(float $amount): int
    {
        return (int) floor($amount / 10000);
    }

    public function addPoints(int $points): void
    {
        $this->increment('total_points', $points);
    }

    public function deductPoints(int $points): bool
    {
        if ($this->total_points < $points) {
            return false;
        }
        $this->decrement('total_points', $points);
        return true;
    }

    public function recordOrder(float $amount): void
    {
        $this->increment('total_orders');
        $this->increment('total_spent', $amount);
        $this->update(['last_order_date' => now()]);
    }
}
