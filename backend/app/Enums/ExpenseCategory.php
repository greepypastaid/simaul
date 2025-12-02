<?php

namespace App\Enums;

enum ExpenseCategory: string
{
    case OPERATIONAL = 'OPERATIONAL';
    case UTILITY = 'UTILITY';
    case MAINTENANCE = 'MAINTENANCE';
    case SALARY = 'SALARY';
    case MARKETING = 'MARKETING';
    case INVENTORY = 'INVENTORY';
    case OTHER = 'OTHER';

    public function label(): string
    {
        return match($this) {
            self::OPERATIONAL => 'Operasional',
            self::UTILITY => 'Utilitas (Listrik, Air)',
            self::MAINTENANCE => 'Perawatan & Perbaikan',
            self::SALARY => 'Gaji Karyawan',
            self::MARKETING => 'Marketing & Promosi',
            self::INVENTORY => 'Pembelian Bahan',
            self::OTHER => 'Lainnya',
        };
    }
}
