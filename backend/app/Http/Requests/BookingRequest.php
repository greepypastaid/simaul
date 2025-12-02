<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class BookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'service_id' => ['required', 'exists:services,id'],
            'estimated_qty' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
            'is_express' => ['nullable', 'boolean'],
            'pickup_date' => ['nullable', 'date', 'after:now'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pelanggan harus diisi',
            'phone.required' => 'Nomor telepon harus diisi',
            'phone.regex' => 'Format nomor telepon tidak valid',
            'service_id.required' => 'Layanan harus dipilih',
            'service_id.exists' => 'Layanan tidak ditemukan',
            'estimated_qty.min' => 'Estimasi berat minimal 0.1',
            'pickup_date.after' => 'Tanggal pickup harus di masa depan',
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
