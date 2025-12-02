<?php

namespace App\Models;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'payment_type',
        'amount',
        'description',
        'notes',
        'expense_date',
        'receipt_path',
        'created_by',
    ];

    protected $casts = [
        'category' => ExpenseCategory::class,
        'payment_type' => ExpenseType::class,
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
