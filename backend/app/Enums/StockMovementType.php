<?php

namespace App\Enums;

enum StockMovementType: string
{
    case IN = 'IN';
    case OUT = 'OUT';
    case ADJUSTMENT = 'ADJUSTMENT';
    case RETURN = 'RETURN';

    public function label(): string
    {
        return match($this) {
            self::IN => 'Stock In',
            self::OUT => 'Stock Out',
            self::ADJUSTMENT => 'Adjustment',
            self::RETURN => 'Return',
        };
    }
}
