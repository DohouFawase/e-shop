<?php

namespace App\Notifications;

use App\Models\Boutique\Review;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewReviewSubmitted extends Notification
{
    public function __construct(protected Review $review) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WebPushChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        $review = $this->review->loadMissing(['user', 'product']);
        $customer = trim(($review->user?->first_name ?? '').' '.($review->user?->last_name ?? ''));

        return [
            'review_id' => $review->id,
            'product_id' => $review->product_id,
            'rating' => $review->rating,
            'customer_name' => $customer !== '' ? $customer : 'Client',
            'message' => 'Un nouvel avis a été publié.',
            'url' => '/dashboard/reviews',
        ];
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        $data = $this->toArray($notifiable);

        return (new WebPushMessage)
            ->title('Nouvel avis produit')
            ->body($data['customer_name'].' a laissé un avis de '.$data['rating'].'/5 sur '.$this->review->product?->name.'.')
            ->icon('/favicon.ico')
            ->action('Voir les avis', 'open_reviews')
            ->data($data)
            ->tag('review-'.$this->review->id);
    }
}
