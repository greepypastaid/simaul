<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class OrderHistory extends Model
{
    use HasFactory;

    public const ACTION_STATUS_CHANGE = 'STATUS_CHANGE';
    public const ACTION_PAYMENT = 'PAYMENT';
    public const ACTION_NOTE = 'NOTE';
    public const ACTION_CREATED = 'CREATED';
    public const ACTION_UPDATED = 'UPDATED';

    protected $fillable = [
        'order_id',
        'status',
        'previous_status',
        'action',
        'notes',
        'notification_sent',
        'notification_sent_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'notification_sent' => 'boolean',
            'notification_sent_at' => 'datetime',
            'status' => OrderStatus::class,
            'previous_status' => OrderStatus::class,
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeTimeline(Builder $query): Builder
    {
        return $query->where('action', self::ACTION_STATUS_CHANGE)
            ->orderBy('created_at', 'asc');
    }

    public static function recordStatusChange(
        Order $order,
        OrderStatus $newStatus,
        ?string $notes = null,
        ?int $userId = null
    ): self {
        return self::create([
            'order_id' => $order->id,
            'status' => $newStatus,
            'previous_status' => $order->status,
            'action' => self::ACTION_STATUS_CHANGE,
            'notes' => $notes,
            'created_by' => $userId,
        ]);
    }

    public static function recordOrderCreation(
        Order $order,
        ?string $notes = null,
        ?int $userId = null
    ): self {
        return self::create([
            'order_id' => $order->id,
            'status' => $order->status,
            'previous_status' => null,
            'action' => self::ACTION_CREATED,
            'notes' => $notes ?? 'Order created',
            'created_by' => $userId,
        ]);
    }

    public static function recordPayment(
        Order $order,
        string $paymentMethod,
        float $amount,
        ?int $userId = null
    ): self {
        return self::create([
            'order_id' => $order->id,
            'status' => $order->status,
            'previous_status' => $order->status,
            'action' => self::ACTION_PAYMENT,
            'notes' => "Payment received: Rp " . number_format($amount, 0, ',', '.') . " via {$paymentMethod}",
            'created_by' => $userId,
        ]);
    }

    public function markNotificationSent(): void
    {
        $this->update([
            'notification_sent' => true,
            'notification_sent_at' => now(),
        ]);
    }

    public function getStatusLabel(): string
    {
        return $this->status->label();
    }
}
