<?php

namespace App\Http\Requests\Boutique\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateProductFormRequest extends FormRequest
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
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:2048'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'discount_starts_at' => ['nullable', 'date'],
            'discount_ends_at' => ['nullable', 'date', 'after:discount_starts_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La catégorie est requise.',
            'category_id.exists' => 'Cette catégorie n\'existe pas.',
            'name.required' => 'Le nom du produit est requis.',
            'price.required' => 'Le prix est requis.',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'unit.required' => 'L\'unité (kg, sac, pièce...) est requise.',
            'stock_quantity.required' => 'La quantité en stock est requise.',
            'images.max' => 'Maximum 5 images.',
            'images.*.image' => 'Chaque fichier doit être une image.',
            'images.*.max' => 'Chaque image ne doit pas dépasser 2 Mo.',
        ];
    }
}
