<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseType;
use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Expense::with('creator:id,name');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('expense_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('expense_date', '<=', $request->to_date);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhere('notes', 'like', "%{$request->search}%");
            });
        }

        $expenses = $query->orderBy('expense_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return $this->success($expenses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'in:' . implode(',', array_column(ExpenseCategory::cases(), 'value'))],
            'payment_type' => ['required', 'in:' . implode(',', array_column(ExpenseType::cases(), 'value'))],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'expense_date' => ['required', 'date'],
        ]);

        $validated['created_by'] = auth()->id();

        $expense = Expense::create($validated);
        $expense->load('creator:id,name');

        return $this->success($expense, 'Pengeluaran berhasil dicatat', 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        $expense->load('creator:id,name');
        return $this->success($expense);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['sometimes', 'in:' . implode(',', array_column(ExpenseCategory::cases(), 'value'))],
            'payment_type' => ['sometimes', 'in:' . implode(',', array_column(ExpenseType::cases(), 'value'))],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['sometimes', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'expense_date' => ['sometimes', 'date'],
        ]);

        $expense->update($validated);
        $expense->load('creator:id,name');

        return $this->success($expense, 'Pengeluaran berhasil diperbarui');
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();
        return $this->success(null, 'Pengeluaran berhasil dihapus');
    }

    public function summary(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $summary = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->category->value => [
                    'label' => $item->category->label(),
                    'total' => (float) $item->total
                ]];
            });

        $totalExpense = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->sum('amount');

        return $this->success([
            'summary' => $summary,
            'total' => (float) $totalExpense,
            'month' => $month,
            'year' => $year,
        ]);
    }
}
