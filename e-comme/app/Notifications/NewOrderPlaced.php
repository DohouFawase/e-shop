<?php

namespace App\Notifications;

use App\Models\Boutique\Order;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewOrderPlaced extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(protected Order $order) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'customer_name' => $this->order->user->first_name.' '.$this->order->user->last_name,
            'total' => $this->order->total,
            'message' => 'Nouvelle commande reçue.',
        ];
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title('Nouvelle commande')
            ->body('Une nouvelle commande de '.$this->toArray($notifiable)['customer_name'].' a été reçue.')
            ->icon('/favicon.ico')
            ->action('Voir la commande', 'open_order')
            ->data(['order_id' => $this->order->id, 'url' => '/dashboard/orders/'.$this->order->id])
            ->tag('order-'.$this->order->id);
    }
}
