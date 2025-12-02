<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AssetType;
use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Asset::query();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('brand', 'like', "%{$request->search}%")
                  ->orWhere('model', 'like', "%{$request->search}%");
            });
        }

        $assets = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        $assets->getCollection()->transform(function ($asset) {
            $asset->current_value = $asset->currentValue();
            return $asset;
        });

        return $this->success($assets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:' . implode(',', array_column(AssetType::cases(), 'value'))],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'purchase_date' => ['required', 'date'],
            'useful_life_months' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'string'],
        ]);

        $asset = Asset::create($validated);
        $asset->current_value = $asset->currentValue();

        return $this->success($asset, 'Aset berhasil ditambahkan', 201);
    }

    public function show(Asset $asset): JsonResponse
    {
        $asset->current_value = $asset->currentValue();
        return $this->success($asset);
    }

    public function update(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:' . implode(',', array_column(AssetType::cases(), 'value'))],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'purchase_price' => ['sometimes', 'numeric', 'min:0'],
            'purchase_date' => ['sometimes', 'date'],
            'useful_life_months' => ['sometimes', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'string'],
        ]);

        $asset->update($validated);
        $asset->current_value = $asset->currentValue();

        return $this->success($asset, 'Aset berhasil diperbarui');
    }

    public function destroy(Asset $asset): JsonResponse
    {
        $asset->delete();
        return $this->success(null, 'Aset berhasil dihapus');
    }

    public function summary(): JsonResponse
    {
        $totalValue = Asset::where('status', 'ACTIVE')->sum('purchase_price');
        $currentValue = Asset::where('status', 'ACTIVE')->get()->sum(function ($asset) {
            return $asset->currentValue();
        });

        $byType = Asset::where('status', 'ACTIVE')
            ->get()
            ->groupBy('type')
            ->map(function ($items, $type) {
                return [
                    'label' => AssetType::from($type)->label(),
                    'count' => $items->count(),
                    'total_value' => $items->sum('purchase_price'),
                    'current_value' => $items->sum(fn($item) => $item->currentValue()),
                ];
            });

        return $this->success([
            'total_purchase_value' => (float) $totalValue,
            'total_current_value' => (float) $currentValue,
            'total_depreciation' => (float) ($totalValue - $currentValue),
            'by_type' => $byType,
        ]);
    }
}
