<?php

namespace App\Http\Requests\Review;

use App\Repositories\Contracts\Reviews\ReviewRepositoryInterface;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'order_item_id' => ['required', 'exists:order_items,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $reviewRepository = app(ReviewRepositoryInterface::class);

            if (
                $this->order_item_id &&
                !$reviewRepository->canReview($this->user(), $this->order_item_id)
            ) {
                $validator->errors()->add(
                    'order_item_id',
                    'Vous ne pouvez pas laisser d\'avis sur cet article (déjà noté, commande non livrée, ou non autorisé).'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'order_item_id.required' => 'L\'article commandé est requis.',
            'rating.required' => 'La note est requise.',
            'rating.min' => 'La note doit être entre 1 et 5.',
            'rating.max' => 'La note doit être entre 1 et 5.',
        ];
    }
}