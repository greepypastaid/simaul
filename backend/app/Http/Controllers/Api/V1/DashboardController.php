<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Api\BaseController;
use App\Models\Asset;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Material;
use App\Models\Order;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends BaseController
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    public function index(): JsonResponse
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $monthlyRevenue = Order::where('created_at', '>=', $thisMonth)
            ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
            ->sum('final_price');

        $monthlyExpenses = Expense::whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year)
            ->sum('amount');

        $data = [
            'today' => [
                'new_orders' => Order::whereDate('created_at', $today)->count(),
                'completed_orders' => Order::whereDate('created_at', $today)
                    ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])->count(),
                'revenue' => Order::whereDate('created_at', $today)
                    ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
                    ->sum('final_price'),
                'new_bookings' => Order::whereDate('created_at', $today)
                    ->where('status', OrderStatus::BOOKED)->count(),
            ],
            'this_month' => [
                'total_orders' => Order::where('created_at', '>=', $thisMonth)->count(),
                'total_revenue' => $monthlyRevenue,
                'total_expenses' => $monthlyExpenses,
                'net_profit' => $monthlyRevenue - $monthlyExpenses,
                'new_customers' => Customer::where('created_at', '>=', $thisMonth)->count(),
            ],
            'pending_actions' => [
                'booked' => Order::where('status', OrderStatus::BOOKED)->count(),
                'pending' => Order::where('status', OrderStatus::PENDING)->count(),
                'processing' => Order::whereIn('status', [OrderStatus::WASHING, OrderStatus::DRYING, OrderStatus::IRONING])->count(),
                'ready_pickup' => Order::where('status', OrderStatus::COMPLETED)->count(),
                'unpaid' => Order::where('payment_status', PaymentStatus::UNPAID)
                    ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])->count(),
            ],
            'inventory_alerts' => [
                'low_stock_count' => Material::whereRaw('stock_qty <= min_stock_alert')
                    ->where('is_active', true)->count(),
                'low_stock_items' => Material::whereRaw('stock_qty <= min_stock_alert')
                    ->where('is_active', true)
                    ->select('id', 'name', 'stock_qty', 'min_stock_alert', 'unit')
                    ->get(),
            ],
            'quick_stats' => [
                'total_employees' => Employee::where('status', 'ACTIVE')->count(),
                'total_assets_value' => Asset::where('status', 'ACTIVE')->sum('purchase_price'),
                'monthly_expenses_breakdown' => Expense::whereMonth('expense_date', now()->month)
                    ->whereYear('expense_date', now()->year)
                    ->select('category', DB::raw('SUM(amount) as total'))
                    ->groupBy('category')
                    ->get()
                    ->mapWithKeys(fn($item) => [$item->category->label() => (float) $item->total]),
            ],
        ];

        return $this->success($data, 'Dashboard data berhasil diambil');
    }

    public function revenue(Request $request): JsonResponse
    {
        $period = $request->input('period', 'daily');
        $dateFrom = $request->input('date_from', now()->subDays(30));
        $dateTo = $request->input('date_to', now());

        $groupBy = match ($period) {
            'weekly' => 'YEARWEEK(created_at)',
            'monthly' => 'DATE_FORMAT(created_at, "%Y-%m")',
            default => 'DATE(created_at)',
        };

        $revenue = Order::whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
            ->selectRaw("{$groupBy} as period, SUM(final_price) as revenue, COUNT(*) as orders")
            ->groupByRaw($groupBy)
            ->orderByRaw($groupBy)
            ->get();

        $summary = [
            'total_revenue' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
                ->sum('final_price'),
            'total_orders' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
                ->count(),
            'average_order_value' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
                ->avg('final_price') ?? 0,
        ];

        return $this->success(['chart_data' => $revenue, 'summary' => $summary], 'Laporan pendapatan berhasil diambil');
    }

    public function servicesReport(Request $request): JsonResponse
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth());
        $dateTo = $request->input('date_to', now());

        $services = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('services', 'order_items.service_id', '=', 'services.id')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->whereIn('orders.status', [OrderStatus::COMPLETED->value, OrderStatus::TAKEN->value])
            ->select(
                'services.id',
                'services.name',
                'services.unit_type',
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(order_items.qty) as total_qty'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('services.id', 'services.name', 'services.unit_type')
            ->orderByDesc('total_revenue')
            ->get();

        return $this->success($services, 'Laporan layanan berhasil diambil');
    }

    public function customersReport(Request $request): JsonResponse
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth());
        $dateTo = $request->input('date_to', now());

        $newCustomers = Customer::whereBetween('created_at', [$dateFrom, $dateTo])->count();
        $returningCustomers = Order::whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->whereHas('customer', fn ($q) => $q->where('created_at', '<', $dateFrom))
            ->distinct('customer_id')
            ->count('customer_id');

        $topCustomers = Customer::withSum(['orders as total_spent' => fn ($query) =>
            $query->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
        ], 'final_price')
        ->having('total_spent', '>', 0)
        ->orderByDesc('total_spent')
        ->limit(10)
        ->get(['id', 'name', 'phone', 'total_points']);

        return $this->success([
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'top_customers' => $topCustomers,
        ], 'Laporan customer berhasil diambil');
    }

    public function operations(): JsonResponse
    {
        $data = [
            'queue' => [
                'waiting_confirmation' => Order::where('status', OrderStatus::BOOKED)
                    ->oldest()
                    ->limit(10)
                    ->with('customer:id,name,phone')
                    ->get(['id', 'tracking_code', 'customer_id', 'created_at']),
                'in_processing' => Order::whereIn('status', [OrderStatus::PENDING, OrderStatus::WASHING, OrderStatus::DRYING, OrderStatus::IRONING])
                    ->oldest()
                    ->limit(10)
                    ->with('customer:id,name,phone')
                    ->get(['id', 'tracking_code', 'customer_id', 'pickup_date']),
                'ready_pickup' => Order::where('status', OrderStatus::COMPLETED)
                    ->oldest()
                    ->limit(10)
                    ->with('customer:id,name,phone')
                    ->get(['id', 'tracking_code', 'customer_id', 'pickup_date', 'final_price', 'payment_status']),
            ],
            'workload' => [
                'pending_kg' => Order::whereIn('status', [OrderStatus::PENDING, OrderStatus::WASHING, OrderStatus::DRYING, OrderStatus::IRONING])
                    ->with('items')
                    ->get()
                    ->sum(fn ($o) => $o->items->sum('qty')),
            ],
        ];

        return $this->success($data, 'Data operasional berhasil diambil');
    }
}
