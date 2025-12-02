<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'ADMIN';
    case STAFF = 'STAFF';
    case CASHIER = 'CASHIER';
}
