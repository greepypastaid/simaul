<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends BaseController
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($search = $request->input('search')) {
            $query->where(fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
            );
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $customers = $query->paginate($request->input('per_page', 15));

        return $this->success(
            CustomerResource::collection($customers)->response()->getData(true),
            'Daftar customer berhasil diambil'
        );
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 10);

        $customers = $this->customerService->search($query, $limit);

        return $this->success(CustomerResource::collection($customers), 'Hasil pencarian customer');
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load(['orders' => fn ($q) => $q->latest()->limit(10)]);
        $stats = $this->customerService->getCustomerStats($customer);

        return $this->success([
            'customer' => new CustomerResource($customer),
            'stats' => $stats,
        ], 'Detail customer berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:customers,phone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:customers,email'],
            'address' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $customer = Customer::create($validated);

        return $this->success(new CustomerResource($customer), 'Customer berhasil dibuat', 201);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20', 'unique:customers,phone,' . $customer->id],
            'email' => ['nullable', 'email', 'max:255', 'unique:customers,email,' . $customer->id],
            'address' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $customer->update($validated);

        return $this->success(new CustomerResource($customer), 'Customer berhasil diperbarui');
    }

    public function destroy(Customer $customer): JsonResponse
    {
        if ($customer->orders()->exists()) {
            return $this->error('Customer tidak dapat dihapus karena memiliki order', 422);
        }

        $customer->delete();

        return $this->success(null, 'Customer berhasil dihapus');
    }

    public function orders(Customer $customer, Request $request): JsonResponse
    {
        $orders = $customer->orders()
            ->with(['items.service'])
            ->latest()
            ->paginate($request->input('per_page', 10));

        return $this->success($orders, 'Riwayat order customer berhasil diambil');
    }

    public function topCustomers(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $customers = $this->customerService->getTopCustomers($limit);

        return $this->success(CustomerResource::collection($customers), 'Top customer berhasil diambil');
    }

    public function adjustPoints(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'points' => ['required', 'integer'],
            'action' => ['required', 'in:add,subtract,set'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $currentPoints = $customer->total_points;

        match ($validated['action']) {
            'add' => $customer->increment('total_points', abs($validated['points'])),
            'subtract' => $customer->decrement('total_points', min(abs($validated['points']), $currentPoints)),
            'set' => $customer->update(['total_points' => max(0, $validated['points'])]),
        };

        return $this->success([
            'customer' => new CustomerResource($customer->fresh()),
            'previous_points' => $currentPoints,
            'new_points' => $customer->fresh()->total_points,
        ], 'Points customer berhasil diperbarui');
    }
}
