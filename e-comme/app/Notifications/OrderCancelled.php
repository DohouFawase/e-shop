<?php

namespace App\Notifications;

use App\Models\Boutique\Order;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class OrderCancelled extends Notification
{
    public function __construct(protected Order $order) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WebPushChannel::class];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'customer_name' => $this->order->user?->first_name
                ? trim($this->order->user->first_name.' '.$this->order->user->last_name)
                : 'Client',
            'total' => $this->order->total,
            'status' => $this->order->status,
            'message' => 'Une commande a été annulée.',
        ];
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title('Commande annulée')
            ->body('La commande de '.$this->toArray($notifiable)['customer_name'].' a été annulée.')
            ->icon('/favicon.ico')
            ->action('Voir la commande', 'open_order')
            ->data(['order_id' => $this->order->id, 'url' => '/dashboard/orders/'.$this->order->id])
            ->tag('order-cancelled-'.$this->order->id);
    }
}
