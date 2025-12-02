<?php

namespace App\Enums;

enum ExpenseType: string
{
    case CASH = 'CASH';
    case TRANSFER = 'TRANSFER';

    public function label(): string
    {
        return match($this) {
            self::CASH => 'Tunai',
            self::TRANSFER => 'Transfer',
        };
    }
}
