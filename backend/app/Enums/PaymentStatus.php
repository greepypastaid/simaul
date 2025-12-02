<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case UNPAID = 'UNPAID';
    case PARTIAL = 'PARTIAL';
    case PAID = 'PAID';
}
