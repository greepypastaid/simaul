<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class ConfirmBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'exists:services,id'],
            'items.*.qty' => ['required', 'numeric', 'min:0.1', 'max:1000'],
            'items.*.is_express' => ['nullable', 'boolean'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
            'pickup_date' => ['nullable', 'date'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'points_used' => ['nullable', 'integer', 'min:0'],
            'payment_status' => ['nullable', Rule::enum(PaymentStatus::class)],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'internal_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Item order harus diisi dengan berat aktual',
            'items.*.service_id.required' => 'Layanan harus dipilih',
            'items.*.qty.required' => 'Berat/jumlah aktual harus diisi',
            'items.*.qty.min' => 'Berat/jumlah minimal 0.1',
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
