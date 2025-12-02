<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required_if:status,PENDING', 'array', 'min:1'],
            'items.*.service_id' => ['required_with:items', 'exists:services,id'],
            'items.*.qty' => ['required_with:items', 'numeric', 'min:0.1'],
            'items.*.is_express' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status harus dipilih',
            'status.in' => 'Status tidak valid',
            'items.required_if' => 'Item order harus diisi saat mengkonfirmasi booking',
            'items.*.qty.required_with' => 'Berat/jumlah harus diisi',
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
