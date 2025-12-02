<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialController extends BaseController
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Material::query();

        if ($request->boolean('active', false)) {
            $query->where('is_active', true);
        }

        if ($request->boolean('low_stock', false)) {
            $query->whereRaw('stock_qty <= min_stock_alert');
        }

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $query->orderBy($request->input('sort_by', 'name'), $request->input('sort_dir', 'asc'));

        $materials = $query->paginate($request->input('per_page', 20));

        return $this->success(
            MaterialResource::collection($materials)->response()->getData(true),
            'Daftar material berhasil diambil'
        );
    }

    public function show(Material $material): JsonResponse
    {
        $history = $this->inventoryService->getStockHistory($material, 20);

        return $this->success([
            'material' => new MaterialResource($material),
            'stock_history' => $history,
        ], 'Detail material berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:materials,sku'],
            'stock_qty' => ['nullable', 'numeric', 'min:0'],
            'min_stock_alert' => ['nullable', 'numeric', 'min:0'],
            'cost_per_unit' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['sku'] ??= 'MAT-' . strtoupper(substr(md5(uniqid()), 0, 8));

        $material = Material::create($validated);

        if (($validated['stock_qty'] ?? 0) > 0) {
            $this->inventoryService->addStock($material, 0, 'Stok awal saat pembuatan material');
        }

        return $this->success(new MaterialResource($material), 'Material berhasil dibuat', 201);
    }

    public function update(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'sku' => ['sometimes', 'string', 'max:50', 'unique:materials,sku,' . $material->id],
            'min_stock_alert' => ['nullable', 'numeric', 'min:0'],
            'cost_per_unit' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $material->update($validated);

        return $this->success(new MaterialResource($material), 'Material berhasil diperbarui');
    }

    public function destroy(Material $material): JsonResponse
    {
        if ($material->services()->exists()) {
            return $this->error('Material tidak dapat dihapus karena digunakan dalam layanan', 422);
        }

        if ($material->stockMovements()->exists()) {
            return $this->error('Material tidak dapat dihapus karena memiliki riwayat stok', 422);
        }

        $material->delete();

        return $this->success(null, 'Material berhasil dihapus');
    }

    public function addStock(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $movement = $this->inventoryService->addStock($material, $validated['quantity'], $validated['notes'] ?? '');

        return $this->success([
            'material' => new MaterialResource($material->fresh()),
            'movement' => $movement,
        ], 'Stok berhasil ditambahkan');
    }

    public function adjustStock(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'new_stock' => ['required', 'numeric', 'min:0'],
            'notes' => ['required', 'string', 'max:500'],
        ]);

        $movement = $this->inventoryService->adjustStock($material, $validated['new_stock'], $validated['notes']);

        return $this->success([
            'material' => new MaterialResource($material->fresh()),
            'movement' => $movement,
        ], 'Stok berhasil disesuaikan');
    }

    public function history(Material $material, Request $request): JsonResponse
    {
        $limit = $request->input('limit', 50);
        $history = $this->inventoryService->getStockHistory($material, $limit);

        return $this->success($history, 'Riwayat stok berhasil diambil');
    }

    public function lowStock(): JsonResponse
    {
        $materials = $this->inventoryService->getLowStockMaterials();

        return $this->success(MaterialResource::collection($materials), 'Daftar material stok rendah berhasil diambil');
    }

    public function stockStatus(): JsonResponse
    {
        $status = $this->inventoryService->getStockStatus();

        return $this->success($status, 'Status stok berhasil diambil');
    }

    public function toggleActive(Material $material): JsonResponse
    {
        $material->update(['is_active' => !$material->is_active]);

        return $this->success(
            new MaterialResource($material),
            $material->is_active ? 'Material diaktifkan' : 'Material dinonaktifkan'
        );
    }
}
