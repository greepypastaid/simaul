<?php

namespace App\Models;

use App\Enums\EmployeePosition;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'phone',
        'address',
        'join_date',
        'base_salary',
        'status',
    ];

    protected $casts = [
        'position' => EmployeePosition::class,
        'join_date' => 'date',
        'base_salary' => 'decimal:2',
    ];

    public function salaries(): HasMany
    {
        return $this->hasMany(Salary::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'ACTIVE';
    }
}
