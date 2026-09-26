<?php

namespace App\Notifications;

use App\Models\Boutique\Order;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class OrderStatusUpdated extends Notification
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
    public function toArray($notifiable): array
    {
        return [
            'title' => 'Commande mise à jour',
            'order_id' => $this->order->id,
            'status' => $this->order->status,
            'total' => $this->order->total,
            'message' => $this->statusMessage(),
            'url' => '/account/orders',
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        $statusLabels = [
            'confirmed' => 'confirmée',
            'shipped' => 'expédiée',
            'delivered' => 'livrée',
            'cancelled' => 'annulée',
        ];

        $statusLabel = $statusLabels[$this->order->status] ?? 'mise à jour';

        return (new WebPushMessage)
            ->title('Commande mise à jour')
            ->body('Votre commande a été '.$statusLabel.'.')
            ->icon('/favicon.ico')
            ->action('Voir la commande', 'open_order')
            ->data([
                'order_id' => $this->order->id,
                'url' => '/account/orders',
            ])
            ->tag('order-status-'.$this->order->id);
    }

    protected function statusMessage(): string
    {
        return match ($this->order->status) {
            'confirmed' => 'Votre commande a été confirmée.',
            'shipped' => 'Votre commande a été expédiée.',
            'delivered' => 'Votre commande a été livrée.',
            'cancelled' => 'Votre commande a été annulée.',
            default => 'Le statut de votre commande a changé.',
        };
    }
}
