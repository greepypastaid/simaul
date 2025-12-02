<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;

class CustomerService
{
    public function findOrCreateByPhone(string $phone, array $data = []): Customer
    {
        $customer = Customer::where('phone', $phone)->first();

        if (!$customer) {
            return Customer::create([
                'name' => $data['name'] ?? 'Customer',
                'phone' => $phone,
                'email' => $data['email'] ?? null,
                'address' => $data['address'] ?? null,
                'notes' => $data['notes'] ?? 'Auto-created from booking',
            ]);
        }

        if (isset($data['name']) && $customer->notes === 'Auto-created from booking') {
            $customer->update(['name' => $data['name']]);
        }

        return $customer;
    }

    public function find(int $id): ?Customer
    {
        return Customer::find($id);
    }

    public function findByPhone(string $phone): ?Customer
    {
        return Customer::where('phone', $phone)->first();
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);
        return $customer->fresh();
    }

    public function addPointsFromOrder(Customer $customer, Order $order): int
    {
        $pointsEarned = (int) floor($order->final_price / 10000);

        if ($pointsEarned > 0) {
            $customer->increment('total_points', $pointsEarned);
        }

        return $pointsEarned;
    }

    public function usePoints(Customer $customer, int $pointsToUse): int
    {
        $actualPointsUsed = min($pointsToUse, $customer->total_points);

        if ($actualPointsUsed > 0) {
            $customer->decrement('total_points', $actualPointsUsed);
        }

        return $actualPointsUsed;
    }

    public function hasEnoughPoints(Customer $customer, int $pointsNeeded): bool
    {
        return $customer->total_points >= $pointsNeeded;
    }

    public function getCustomerStats(Customer $customer): array
    {
        $orders = $customer->orders();

        return [
            'total_orders' => $orders->count(),
            'completed_orders' => $orders->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])->count(),
            'total_spent' => $orders->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])->sum('final_price'),
            'total_points' => $customer->total_points,
            'member_since' => $customer->created_at,
            'last_order' => $orders->latest()->first()?->created_at,
        ];
    }

    public function search(string $query, int $limit = 10): Collection
    {
        return Customer::where('name', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->limit($limit)
            ->get();
    }

    public function getInactiveCustomers(int $daysInactive = 30, int $limit = 50): Collection
    {
        return Customer::where(function ($query) use ($daysInactive) {
            $query->whereDoesntHave('orders')
                ->orWhereHas('orders', fn ($q) => $q->where('created_at', '<', now()->subDays($daysInactive)));
        })
        ->limit($limit)
        ->get();
    }

    public function getTopCustomers(int $limit = 10): Collection
    {
        return Customer::withSum(['orders as total_spent' => fn ($query) =>
            $query->whereIn('status', [OrderStatus::COMPLETED, OrderStatus::TAKEN])
        ], 'final_price')
        ->orderByDesc('total_spent')
        ->limit($limit)
        ->get();
    }
}
