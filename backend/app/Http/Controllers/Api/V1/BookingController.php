<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;

class BookingController extends BaseController
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function store(BookingRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createBooking($request->validated());

            return $this->success([
                'order' => new OrderResource($order),
                'tracking_code' => $order->tracking_code,
                'message' => 'Booking berhasil! Gunakan kode tracking untuk memantau status pesanan.',
            ], 'Booking berhasil dibuat', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
