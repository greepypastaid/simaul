<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\TrackingResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;

class TrackingController extends BaseController
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function show(string $trackingCode): JsonResponse
    {
        $order = $this->orderService->findByTrackingCode($trackingCode);

        if (!$order) {
            return $this->error('Pesanan tidak ditemukan. Pastikan kode tracking sudah benar.', 404);
        }

        return $this->success(new TrackingResource($order), 'Data tracking berhasil diambil');
    }
}
