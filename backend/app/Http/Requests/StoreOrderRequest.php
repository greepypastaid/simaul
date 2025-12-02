<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'exists:customers,id'],
            'customer_name' => ['required_without:customer_id', 'string', 'max:255'],
            'phone' => ['required_without:customer_id', 'string', 'max:20'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'exists:services,id'],
            'items.*.qty' => ['required', 'numeric', 'min:0.1', 'max:1000'],
            'items.*.is_express' => ['nullable', 'boolean'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
            'is_express' => ['nullable', 'boolean'],
            'pickup_date' => ['nullable', 'date'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'points_used' => ['nullable', 'integer', 'min:0'],
            'payment_status' => ['nullable', Rule::enum(PaymentStatus::class)],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
            'internal_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required_without' => 'Nama pelanggan harus diisi jika customer_id tidak ada',
            'phone.required_without' => 'Nomor telepon harus diisi jika customer_id tidak ada',
            'items.required' => 'Minimal satu item harus ditambahkan',
            'items.*.service_id.required' => 'Layanan harus dipilih',
            'items.*.service_id.exists' => 'Layanan tidak ditemukan',
            'items.*.qty.required' => 'Jumlah/berat harus diisi',
            'items.*.qty.min' => 'Jumlah/berat minimal 0.1',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422));
    }
}
