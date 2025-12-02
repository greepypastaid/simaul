<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'month',
        'year',
        'base_amount',
        'bonus',
        'deduction',
        'total_amount',
        'payment_date',
        'notes',
        'paid_by',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'base_amount' => 'decimal:2',
        'bonus' => 'decimal:2',
        'deduction' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($salary) {
            $salary->total_amount = $salary->base_amount + $salary->bonus - $salary->deduction;
        });

        static::updating(function ($salary) {
            $salary->total_amount = $salary->base_amount + $salary->bonus - $salary->deduction;
        });
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}
