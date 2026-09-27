<?php

namespace App\Http\Requests\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'shipping_address' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['nullable', 'in:cash_on_delivery,cinetpay'],
            'sales_terms_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_address.required' => 'L\'adresse de livraison est requise.',
            'phone.required' => 'Le numéro de téléphone est requis.',
        ];
    }
}
