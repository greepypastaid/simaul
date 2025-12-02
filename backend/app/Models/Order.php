<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'tracking_code',
        'total_price',
        'weight_qty',
        'discount_amount',
        'final_price',
        'pickup_date',
        'estimated_completion',
        'actual_completion',
        'status',
        'payment_status',
        'payment_method',
        'is_express',
        'points_earned',
        'points_used',
        'customer_notes',
        'internal_notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'weight_qty' => 'decimal:3',
            'discount_amount' => 'decimal:2',
            'final_price' => 'decimal:2',
            'pickup_date' => 'datetime',
            'estimated_completion' => 'datetime',
            'actual_completion' => 'datetime',
            'is_express' => 'boolean',
            'points_earned' => 'integer',
            'points_used' => 'integer',
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'payment_method' => PaymentMethod::class,
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(OrderHistory::class)->orderBy('created_at', 'desc');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeByTrackingCode(Builder $query, string $code): Builder
    {
        return $query->where('tracking_code', strtoupper($code));
    }

    public function scopeByStatus(Builder $query, OrderStatus $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->whereIn('status', [
            OrderStatus::BOOKED,
            OrderStatus::PENDING,
            OrderStatus::WASHING,
            OrderStatus::DRYING,
            OrderStatus::IRONING,
        ]);
    }

    public function scopeReadyForPickup(Builder $query): Builder
    {
        return $query->where('status', OrderStatus::COMPLETED);
    }

    public static function generateTrackingCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
            $code = preg_replace('/[0OIL1]/', '', $code);
            $code = str_pad($code, 6, strtoupper(Str::random(1)));
        } while (self::where('tracking_code', $code)->exists());

        return $code;
    }

    public function canTransitionTo(OrderStatus $newStatus): bool
    {
        return in_array($newStatus, $this->status->transitions());
    }

    public function requiresStockDeduction(): bool
    {
        return $this->status === OrderStatus::BOOKED;
    }

    public function isFinal(): bool
    {
        return in_array($this->status, [OrderStatus::TAKEN, OrderStatus::CANCELLED]);
    }

    public function canBeCancelled(): bool
    {
        return !$this->isFinal();
    }

    public function calculateFinalPrice(): void
    {
        $this->final_price = $this->total_price - $this->discount_amount;
    }

    public function getStatusLabel(): string
    {
        return $this->status->label();
    }
}
