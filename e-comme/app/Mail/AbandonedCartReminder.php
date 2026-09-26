<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class AbandonedCartReminder extends Mailable
{
    use Queueable, SerializesModels;

    /** @param Collection<int, \App\Models\Boutique\CartItem> $items */
    public function __construct(
        public readonly string $customerName,
        public readonly Collection $items,
        public readonly string $cartUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre panier vous attend chez Naya');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.abandoned-cart-reminder');
    }
}
