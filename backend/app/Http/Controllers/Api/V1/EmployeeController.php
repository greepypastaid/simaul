<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EmployeePosition;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Salary;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Employee::query();

        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        $employees = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return $this->success($employees);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'in:' . implode(',', array_column(EmployeePosition::cases(), 'value'))],
            'phone' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'join_date' => ['required', 'date'],
            'base_salary' => ['required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'string'],
        ]);

        $employee = Employee::create($validated);

        return $this->success($employee, 'Karyawan berhasil ditambahkan', 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load('salaries');
        return $this->success($employee);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'in:' . implode(',', array_column(EmployeePosition::cases(), 'value'))],
            'phone' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'join_date' => ['sometimes', 'date'],
            'base_salary' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'string'],
        ]);

        $employee->update($validated);

        return $this->success($employee, 'Karyawan berhasil diperbarui');
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();
        return $this->success(null, 'Karyawan berhasil dihapus');
    }

    public function paySalary(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2020'],
            'bonus' => ['nullable', 'numeric', 'min:0'],
            'deduction' => ['nullable', 'numeric', 'min:0'],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $existing = Salary::where('employee_id', $employee->id)
            ->where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->first();

        if ($existing) {
            return $this->error('Gaji untuk bulan dan tahun ini sudah dibayarkan', 422);
        }

        $salary = Salary::create([
            'employee_id' => $employee->id,
            'month' => $validated['month'],
            'year' => $validated['year'],
            'base_amount' => $employee->base_salary,
            'bonus' => $validated['bonus'] ?? 0,
            'deduction' => $validated['deduction'] ?? 0,
            'payment_date' => $validated['payment_date'],
            'notes' => $validated['notes'] ?? null,
            'paid_by' => auth()->id(),
        ]);

        $salary->load(['employee', 'paidBy:id,name']);

        return $this->success($salary, 'Gaji berhasil dibayarkan', 201);
    }
}
