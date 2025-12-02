<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Material;
use App\Models\Order;
use App\Models\Salary;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    public function financialSummary(Request $request): JsonResponse
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $revenue = Order::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->whereIn('payment_status', ['PAID', 'PARTIAL'])
            ->sum('total_price');

        $expenses = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->sum('amount');

        $salaries = Salary::where('month', $month)
            ->where('year', $year)
            ->sum('total_amount');

        $profit = $revenue - $expenses - $salaries;

        $revenueByDay = Order::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->whereIn('payment_status', ['PAID', 'PARTIAL'])
            ->select(DB::raw('DAY(created_at) as day'), DB::raw('SUM(total_price) as total'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $expensesByCategory = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category->label(),
                    'total' => (float) $item->total,
                ];
            });

        return $this->success([
            'revenue' => (float) $revenue,
            'expenses' => (float) $expenses,
            'salaries' => (float) $salaries,
            'total_expenses' => (float) ($expenses + $salaries),
            'profit' => (float) $profit,
            'profit_margin' => $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0,
            'revenue_by_day' => $revenueByDay,
            'expenses_by_category' => $expensesByCategory,
            'month' => $month,
            'year' => $year,
        ]);
    }

    public function inventoryReport(): JsonResponse
    {
        $materials = Material::orderBy('stock', 'asc')->get();

        $lowStock = $materials->filter(fn($m) => $m->stock < $m->min_stock)->count();
        $totalValue = $materials->sum(fn($m) => $m->stock * $m->unit_price);

        return $this->success([
            'materials' => $materials,
            'total_items' => $materials->count(),
            'low_stock_count' => $lowStock,
            'total_value' => (float) $totalValue,
        ]);
    }

    public function assetReport(): JsonResponse
    {
        $assets = Asset::where('status', 'ACTIVE')->get();

        $totalPurchaseValue = $assets->sum('purchase_price');
        $totalCurrentValue = $assets->sum(fn($asset) => $asset->currentValue());
        $totalDepreciation = $totalPurchaseValue - $totalCurrentValue;

        $byType = $assets->groupBy('type')->map(function ($items, $type) {
            return [
                'type' => $type,
                'label' => $items->first()->type->label(),
                'count' => $items->count(),
                'purchase_value' => $items->sum('purchase_price'),
                'current_value' => $items->sum(fn($i) => $i->currentValue()),
            ];
        })->values();

        return $this->success([
            'total_assets' => $assets->count(),
            'total_purchase_value' => (float) $totalPurchaseValue,
            'total_current_value' => (float) $totalCurrentValue,
            'total_depreciation' => (float) $totalDepreciation,
            'by_type' => $byType,
        ]);
    }

    public function employeeReport(): JsonResponse
    {
        $employees = Employee::where('status', 'ACTIVE')->get();

        $totalSalary = $employees->sum('base_salary');

        $byPosition = $employees->groupBy('position')->map(function ($items, $position) {
            return [
                'position' => $position,
                'label' => $items->first()->position->label(),
                'count' => $items->count(),
                'total_salary' => $items->sum('base_salary'),
            ];
        })->values();

        $currentMonth = now()->month;
        $currentYear = now()->year;
        $paidSalaries = Salary::where('month', $currentMonth)
            ->where('year', $currentYear)
            ->sum('total_amount');

        return $this->success([
            'total_employees' => $employees->count(),
            'total_base_salary' => (float) $totalSalary,
            'by_position' => $byPosition,
            'current_month_paid' => (float) $paidSalaries,
        ]);
    }

    public function profitLoss(Request $request): JsonResponse
    {
        $fromDate = $request->input('from_date', now()->startOfMonth()->format('Y-m-d'));
        $toDate = $request->input('to_date', now()->endOfMonth()->format('Y-m-d'));

        $revenue = Order::whereBetween('created_at', [$fromDate, $toDate])
            ->whereIn('payment_status', ['PAID', 'PARTIAL'])
            ->sum('total_price');

        $expenses = Expense::whereBetween('expense_date', [$fromDate, $toDate])
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->category->label() => (float) $item->total];
            });

        $salaries = Salary::whereBetween('payment_date', [$fromDate, $toDate])
            ->sum('total_amount');

        $totalExpenses = $expenses->sum() + $salaries;
        $netProfit = $revenue - $totalExpenses;

        return $this->success([
            'period' => [
                'from' => $fromDate,
                'to' => $toDate,
            ],
            'revenue' => (float) $revenue,
            'expenses' => $expenses->toArray(),
            'salaries' => (float) $salaries,
            'total_expenses' => (float) $totalExpenses,
            'net_profit' => (float) $netProfit,
            'profit_margin' => $revenue > 0 ? round(($netProfit / $revenue) * 100, 2) : 0,
        ]);
    }
}
