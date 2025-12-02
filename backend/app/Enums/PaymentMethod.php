<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'CASH';
    case TRANSFER = 'TRANSFER';
    case QRIS = 'QRIS';
    case OTHER = 'OTHER';
}
