<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\ConfirmBookingRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends BaseController
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'status',
            'payment_status',
            'customer_id',
            'date_from',
            'date_to',
            'search',
        ]);

        $orders = $this->orderService->getOrders($filters, $request->input('per_page', 15));

        return $this->success(
            OrderResource::collection($orders)->response()->getData(true),
            'Daftar order berhasil diambil'
        );
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['customer', 'items.service', 'histories.creator', 'createdBy']);

        return $this->success(new OrderResource($order), 'Detail order berhasil diambil');
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createWalkInOrder($request->validated());

            return $this->success(
                new OrderResource($order),
                'Order walk-in berhasil dibuat',
                201
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function confirm(Order $order, ConfirmBookingRequest $request): JsonResponse
    {
        try {
            $confirmedOrder = $this->orderService->confirmBooking($order, $request->validated());

            return $this->success(
                new OrderResource($confirmedOrder),
                'Booking berhasil dikonfirmasi'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function updateStatus(Order $order, UpdateOrderStatusRequest $request): JsonResponse
    {
        try {
            $newStatus = OrderStatus::from($request->input('status'));
            $updatedOrder = $this->orderService->updateStatus(
                $order,
                $newStatus,
                $request->input('notes')
            );

            return $this->success(
                new OrderResource($updatedOrder),
                'Status order berhasil diperbarui'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function updatePayment(Order $order, Request $request): JsonResponse
    {
        $request->validate([
            'payment_status' => ['required', 'in:UNPAID,PARTIAL,PAID'],
            'payment_method' => ['nullable', 'in:CASH,TRANSFER,QRIS,OTHER'],
        ]);

        try {
            $paymentStatus = PaymentStatus::from($request->input('payment_status'));
            $updatedOrder = $this->orderService->updatePayment(
                $order,
                $paymentStatus,
                $request->input('payment_method')
            );

            return $this->success(
                new OrderResource($updatedOrder),
                'Status pembayaran berhasil diperbarui'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function stats(Request $request): JsonResponse
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth());
        $dateTo = $request->input('date_to', now()->endOfMonth());

        $stats = [
            'total_orders' => Order::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'total_revenue' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
                ->sum('final_price'),
            'orders_by_status' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'orders_by_payment' => Order::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('payment_status, COUNT(*) as count')
                ->groupBy('payment_status')
                ->pluck('count', 'payment_status'),
            'pending_pickup' => Order::where('status', OrderStatus::COMPLETED)->count(),
            'in_processing' => Order::whereIn('status', [OrderStatus::WASHING, OrderStatus::DRYING, OrderStatus::IRONING])->count(),
        ];

        return $this->success($stats, 'Statistik order berhasil diambil');
    }
}
