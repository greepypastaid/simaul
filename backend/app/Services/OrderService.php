<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Service;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected CustomerService $customerService,
        protected InventoryService $inventoryService
    ) {}

    public function createBooking(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $customer = $this->customerService->findOrCreateByPhone(
                $data['phone'],
                [
                    'name' => $data['customer_name'],
                    'email' => $data['email'] ?? null,
                    'address' => $data['address'] ?? null,
                ]
            );

            $trackingCode = $this->generateTrackingCode();
            $service = Service::findOrFail($data['service_id']);
            $estimatedQty = $data['estimated_weight'] ?? 1;
            $estimatedPrice = $service->calculatePrice($estimatedQty, $data['is_express'] ?? false);

            $order = Order::create([
                'tracking_code' => $trackingCode,
                'customer_id' => $customer->id,
                'status' => OrderStatus::BOOKED,
                'total_price' => $estimatedPrice,
                'discount_amount' => 0,
                'final_price' => $estimatedPrice,
                'payment_status' => PaymentStatus::UNPAID,
                'payment_method' => null,
                'pickup_date' => $data['pickup_date'] ?? null,
                'customer_notes' => $data['notes'] ?? null,
                'internal_notes' => null,
                'created_by' => null,
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'service_id' => $service->id,
                'qty' => $estimatedQty,
                'price_at_moment' => $service->price,
                'is_express' => $data['is_express'] ?? false,
                'subtotal' => $estimatedPrice,
                'notes' => $data['item_notes'] ?? null,
            ]);

            $this->addHistory($order, OrderStatus::BOOKED, 'Booking dibuat melalui form publik');

            return $order->load(['customer', 'items.service']);
        });
    }

    public function confirmBooking(Order $order, array $data): Order
    {
        if ($order->status !== OrderStatus::BOOKED) {
            throw new \Exception('Hanya booking dengan status BOOKED yang dapat dikonfirmasi');
        }

        return DB::transaction(function () use ($order, $data) {
            $order->items()->delete();

            $totalAmount = 0;

            foreach ($data['items'] as $itemData) {
                $service = Service::findOrFail($itemData['service_id']);
                $qty = $itemData['qty'];
                $isExpress = $itemData['is_express'] ?? false;
                $subtotal = $service->calculatePrice($qty, $isExpress);

                OrderItem::create([
                    'order_id' => $order->id,
                    'service_id' => $service->id,
                    'qty' => $qty,
                    'price_at_moment' => $service->price,
                    'is_express' => $isExpress,
                    'subtotal' => $subtotal,
                    'notes' => $itemData['notes'] ?? null,
                ]);

                $totalAmount += $subtotal;
            }

            $pointsUsed = 0;
            $pointsDiscount = 0;
            if (isset($data['points_used']) && $data['points_used'] > 0) {
                $customer = $order->customer;
                $pointsUsed = $this->customerService->usePoints($customer, $data['points_used']);
                $pointsDiscount = $pointsUsed * 100;
            }

            $discountAmount = ($data['discount_amount'] ?? 0) + $pointsDiscount;
            $finalAmount = max(0, $totalAmount - $discountAmount);

            $stockCheck = $this->inventoryService->checkStockAvailability($order->fresh()->items);
            if (!$stockCheck['sufficient']) {
                throw new \Exception('Stok material tidak mencukupi: ' . json_encode($stockCheck['shortage']));
            }

            $this->inventoryService->deductStockForOrder($order->fresh());

            $order->update([
                'status' => OrderStatus::PENDING,
                'total_price' => $totalAmount,
                'discount_amount' => $discountAmount,
                'final_price' => $finalAmount,
                'points_used' => $pointsUsed,
                'payment_status' => PaymentStatus::tryFrom($data['payment_status'] ?? 'UNPAID') ?? PaymentStatus::UNPAID,
                'payment_method' => $data['payment_method'] ?? null,
                'pickup_date' => $data['pickup_date'] ?? $order->pickup_date,
                'internal_notes' => $data['internal_notes'] ?? $order->internal_notes,
            ]);

            $this->addHistory($order, OrderStatus::PENDING, 'Booking dikonfirmasi, laundry diterima', auth()->id());

            return $order->fresh()->load(['customer', 'items.service']);
        });
    }

    public function createWalkInOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $customer = $this->customerService->findOrCreateByPhone(
                $data['phone'],
                [
                    'name' => $data['customer_name'],
                    'email' => $data['email'] ?? null,
                    'address' => $data['address'] ?? null,
                ]
            );

            $trackingCode = $this->generateTrackingCode();

            $totalAmount = 0;
            $orderItems = [];

            foreach ($data['items'] as $itemData) {
                $service = Service::findOrFail($itemData['service_id']);
                $qty = $itemData['qty'];
                $isExpress = $itemData['is_express'] ?? false;
                $subtotal = $service->calculatePrice($qty, $isExpress);

                $orderItems[] = [
                    'service_id' => $service->id,
                    'qty' => $qty,
                    'price_at_moment' => $service->price,
                    'is_express' => $isExpress,
                    'subtotal' => $subtotal,
                    'notes' => $itemData['notes'] ?? null,
                ];

                $totalAmount += $subtotal;
            }

            $pointsUsed = 0;
            $pointsDiscount = 0;
            if (isset($data['points_used']) && $data['points_used'] > 0) {
                $pointsUsed = $this->customerService->usePoints($customer, $data['points_used']);
                $pointsDiscount = $pointsUsed * 100;
            }

            $discountAmount = ($data['discount_amount'] ?? 0) + $pointsDiscount;
            $finalAmount = max(0, $totalAmount - $discountAmount);

            $order = Order::create([
                'tracking_code' => $trackingCode,
                'customer_id' => $customer->id,
                'status' => OrderStatus::PENDING,
                'total_price' => $totalAmount,
                'discount_amount' => $discountAmount,
                'final_price' => $finalAmount,
                'points_used' => $pointsUsed,
                'payment_status' => PaymentStatus::tryFrom($data['payment_status'] ?? 'UNPAID') ?? PaymentStatus::UNPAID,
                'payment_method' => $data['payment_method'] ?? null,
                'pickup_date' => $data['pickup_date'] ?? null,
                'customer_notes' => $data['notes'] ?? null,
                'internal_notes' => $data['internal_notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            $stockCheck = $this->inventoryService->checkStockAvailability($order->items);
            if (!$stockCheck['sufficient']) {
                throw new \Exception('Stok material tidak mencukupi: ' . json_encode($stockCheck['shortage']));
            }

            $this->inventoryService->deductStockForOrder($order);

            $this->addHistory($order, OrderStatus::PENDING, 'Order walk-in dibuat, laundry diterima', auth()->id());

            return $order->load(['customer', 'items.service']);
        });
    }

    public function updateStatus(Order $order, OrderStatus $newStatus, ?string $notes = null): Order
    {
        if (!$order->canTransitionTo($newStatus)) {
            $allowed = implode(', ', array_map(fn ($s) => $s->value, $order->status->transitions()));
            throw new \Exception("Tidak dapat mengubah status dari {$order->status->value} ke {$newStatus->value}. Status yang diizinkan: {$allowed}");
        }

        return DB::transaction(function () use ($order, $newStatus, $notes) {
            $oldStatus = $order->status;

            if ($newStatus === OrderStatus::CANCELLED && in_array($oldStatus, [
                OrderStatus::PENDING,
                OrderStatus::WASHING,
                OrderStatus::DRYING,
                OrderStatus::IRONING
            ])) {
                $this->inventoryService->restoreStockForOrder($order);
            }

            if ($newStatus === OrderStatus::TAKEN) {
                $this->customerService->addPointsFromOrder($order->customer, $order);
            }

            $order->update(['status' => $newStatus]);

            $historyNote = $notes ?? $this->getDefaultStatusNote($newStatus);
            $this->addHistory($order, $newStatus, $historyNote, auth()->id());

            return $order->fresh()->load(['customer', 'items.service', 'histories']);
        });
    }

    public function updatePayment(Order $order, PaymentStatus $paymentStatus, ?string $paymentMethod = null): Order
    {
        $order->update([
            'payment_status' => $paymentStatus,
            'payment_method' => $paymentMethod ?? $order->payment_method,
        ]);

        $note = match ($paymentStatus) {
            PaymentStatus::PAID => 'Pembayaran lunas',
            PaymentStatus::PARTIAL => 'Pembayaran sebagian',
            PaymentStatus::UNPAID => 'Status pembayaran diubah ke belum bayar',
        };

        $this->addHistory($order, $order->status, $note, auth()->id());

        return $order->fresh();
    }

    public function addHistory(Order $order, OrderStatus $status, string $notes, ?int $createdBy = null): OrderHistory
    {
        return OrderHistory::create([
            'order_id' => $order->id,
            'status' => $status,
            'action' => 'STATUS_CHANGE',
            'notes' => $notes,
            'created_by' => $createdBy,
        ]);
    }

    protected function generateTrackingCode(): string
    {
        do {
            $trackingCode = strtoupper(Str::random(10));
        } while (Order::where('tracking_code', $trackingCode)->exists());

        return $trackingCode;
    }

    protected function getDefaultStatusNote(OrderStatus $status): string
    {
        return match ($status) {
            OrderStatus::BOOKED => 'Booking dibuat',
            OrderStatus::PENDING => 'Laundry diterima',
            OrderStatus::WASHING => 'Laundry sedang dicuci',
            OrderStatus::DRYING => 'Laundry sedang dikeringkan',
            OrderStatus::IRONING => 'Laundry sedang disetrika',
            OrderStatus::COMPLETED => 'Laundry siap diambil',
            OrderStatus::TAKEN => 'Laundry sudah diambil',
            OrderStatus::CANCELLED => 'Order dibatalkan',
        };
    }

    public function findByTrackingCode(string $trackingCode): ?Order
    {
        return Order::where('tracking_code', $trackingCode)
            ->with(['items.service', 'histories' => fn ($q) => $q->orderBy('created_at', 'asc')])
            ->first();
    }

    public function getOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with(['customer', 'items.service', 'createdBy']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) =>
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                    );
            });
        }

        return $query->latest()->paginate($perPage);
    }
}
