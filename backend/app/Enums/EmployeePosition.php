<?php

namespace App\Enums;

enum EmployeePosition: string
{
    case WASHER = 'WASHER';
    case IRONER = 'IRONER';
    case PACKER = 'PACKER';
    case DELIVERY = 'DELIVERY';
    case HELPER = 'HELPER';

    public function label(): string
    {
        return match($this) {
            self::WASHER => 'Pencuci',
            self::IRONER => 'Penyetrika',
            self::PACKER => 'Packing',
            self::DELIVERY => 'Kurir',
            self::HELPER => 'Helper',
        };
    }
}
