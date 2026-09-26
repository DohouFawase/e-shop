<?php

namespace App\Notifications;

use App\Models\Boutique\Order;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class OrderPaymentStatusUpdated extends Notification
{
    public function __construct(
        protected Order $order,
        protected bool $paid,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WebPushChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->paid ? 'Paiement confirmé' : 'Paiement échoué',
            'order_id' => $this->order->id,
            'payment_status' => $this->paid ? 'paid' : 'failed',
            'total' => $this->order->total,
            'message' => $this->paid
                ? 'Le paiement de votre commande a été confirmé.'
                : 'Le paiement de votre commande a échoué. Vous pouvez réessayer depuis vos commandes.',
            'url' => '/account/orders',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        $data = $this->toArray($notifiable);

        return (new WebPushMessage)
            ->title($this->paid ? 'Paiement confirmé' : 'Paiement échoué')
            ->body($this->paid
                ? 'Le paiement de votre commande a bien été reçu.'
                : 'Reprenez le paiement depuis la page Mes commandes.')
            ->icon('/favicon.ico')
            ->action('Voir mes commandes', 'open_orders')
            ->data($data)
            ->tag('payment-'.$this->order->id);
    }
}
