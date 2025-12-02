<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UnitType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        if ($request->boolean('active', false)) {
            $query->active();
        }

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $query->orderBy($request->input('sort_by', 'name'), $request->input('sort_dir', 'asc'));

        $services = $query->get();

        return $this->success(ServiceResource::collection($services), 'Daftar layanan berhasil diambil');
    }

    public function show(Service $service): JsonResponse
    {
        $service->load('materials');

        return $this->success(new ServiceResource($service), 'Detail layanan berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:services,code'],
            'description' => ['nullable', 'string', 'max:1000'],
            'unit_type' => ['required', 'in:KG,PCS'],
            'price' => ['required', 'numeric', 'min:0'],
            'express_multiplier' => ['nullable', 'numeric', 'min:1'],
            'estimated_duration_hours' => ['nullable', 'integer', 'min:1'],
            'is_express_available' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['express_multiplier'] ??= 1.5;

        $service = Service::create($validated);

        return $this->success(new ServiceResource($service), 'Layanan berhasil dibuat', 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50', 'unique:services,code,' . $service->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'unit_type' => ['sometimes', 'in:KG,PCS'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'express_multiplier' => ['nullable', 'numeric', 'min:1'],
            'estimated_duration_hours' => ['nullable', 'integer', 'min:1'],
            'is_express_available' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $service->update($validated);

        return $this->success(new ServiceResource($service), 'Layanan berhasil diperbarui');
    }

    public function destroy(Service $service): JsonResponse
    {
        if ($service->orderItems()->exists()) {
            return $this->error('Layanan tidak dapat dihapus karena sudah digunakan dalam order', 422);
        }

        $service->delete();

        return $this->success(null, 'Layanan berhasil dihapus');
    }

    public function updateMaterials(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'materials' => ['required', 'array'],
            'materials.*.material_id' => ['required', 'exists:materials,id'],
            'materials.*.quantity_needed' => ['required', 'numeric', 'min:0.001'],
        ]);

        $syncData = collect($validated['materials'])
            ->mapWithKeys(fn ($m) => [$m['material_id'] => ['quantity_needed' => $m['quantity_needed']]])
            ->toArray();

        $service->materials()->sync($syncData);

        return $this->success(new ServiceResource($service->load('materials')), 'Material layanan berhasil diperbarui');
    }

    public function toggleActive(Service $service): JsonResponse
    {
        $service->update(['is_active' => !$service->is_active]);

        return $this->success(
            new ServiceResource($service),
            $service->is_active ? 'Layanan diaktifkan' : 'Layanan dinonaktifkan'
        );
    }
}
