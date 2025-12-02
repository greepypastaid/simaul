<?php

namespace App\Enums;

enum OrderStatus: string
{
    case BOOKED = 'BOOKED';
    case PENDING = 'PENDING';
    case WASHING = 'WASHING';
    case DRYING = 'DRYING';
    case IRONING = 'IRONING';
    case COMPLETED = 'COMPLETED';
    case READY = 'READY';
    case TAKEN = 'TAKEN';
    case CANCELLED = 'CANCELLED';

    public function label(): string
    {
        return match($this) {
            self::BOOKED => 'Dipesan',
            self::PENDING => 'Menunggu',
            self::WASHING => 'Dicuci',
            self::DRYING => 'Dikeringkan',
            self::IRONING => 'Disetrika',
            self::COMPLETED => 'Selesai',
            self::READY => 'Siap Ambil',
            self::TAKEN => 'Diambil',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function allowedTransitions(): array
    {
        return match($this) {
            self::BOOKED => [self::PENDING, self::WASHING, self::CANCELLED],
            self::PENDING => [self::WASHING, self::CANCELLED],
            self::WASHING => [self::DRYING, self::IRONING, self::COMPLETED, self::CANCELLED],
            self::DRYING => [self::IRONING, self::COMPLETED, self::READY, self::CANCELLED],
            self::IRONING => [self::COMPLETED, self::READY, self::CANCELLED],
            self::COMPLETED => [self::READY, self::TAKEN, self::CANCELLED],
            self::READY => [self::TAKEN, self::CANCELLED],
            self::TAKEN, self::CANCELLED => [],
        };
    }

    public function transitions(): array
    {
        return $this->allowedTransitions();
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions());
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::TAKEN, self::CANCELLED]);
    }

    public function requiresStockDeduction(): bool
    {
        return $this === self::BOOKED;
    }
}
