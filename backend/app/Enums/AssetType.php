<?php

namespace App\Enums;

enum AssetType: string
{
    case WASHING_MACHINE = 'WASHING_MACHINE';
    case DRYER = 'DRYER';
    case IRON = 'IRON';
    case EQUIPMENT = 'EQUIPMENT';
    case FURNITURE = 'FURNITURE';
    case VEHICLE = 'VEHICLE';
    case OTHER = 'OTHER';

    public function label(): string
    {
        return match($this) {
            self::WASHING_MACHINE => 'Mesin Cuci',
            self::DRYER => 'Mesin Pengering',
            self::IRON => 'Setrika',
            self::EQUIPMENT => 'Peralatan',
            self::FURNITURE => 'Furniture',
            self::VEHICLE => 'Kendaraan',
            self::OTHER => 'Lainnya',
        };
    }
}
