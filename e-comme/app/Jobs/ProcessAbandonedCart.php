<?php

namespace App\Jobs;

use App\Mail\AbandonedCartReminder;
use App\Models\Boutique\Cart;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class ProcessAbandonedCart implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $uniqueFor = 86400;

    public function __construct(public readonly string $cartId) {}

    public function uniqueId(): string
    {
        return $this->cartId;
    }

    public function handle(): void
    {
        $cart = Cart::with(['user', 'items.product'])->find($this->cartId);
        if (! $cart || $cart->items->isEmpty() || ! $cart->user?->email) {
            return;
        }

        $latestItemActivity = $cart->items->max('updated_at');
        $lastActivity = collect([$cart->updated_at, $latestItemActivity])
            ->filter()
            ->max();
        if (! $lastActivity) {
            return;
        }

        $now = now();
        $timezone = $cart->user->timezone ?: 'Africa/Abidjan';
        if ($now->copy()->setTimezone($timezone)->format('G') !== '9') {
            return;
        }

        if ($lastActivity->lte($now->copy()->subDays(7))) {
            $cutoff = $now->copy()->subDays(7);
            $stillAbandoned = Cart::query()
                ->whereKey($cart->id)
                ->where('updated_at', '<=', $cutoff)
                ->exists();
            if ($stillAbandoned) {
                $cart->items()->delete();
                $cart->forceFill(['abandoned_reminder_sent_at' => null])->save();
            }

            return;
        }

        if ($lastActivity->gt($now->copy()->subDays(3)) || $cart->abandoned_reminder_sent_at) {
            return;
        }

        Mail::to($cart->user->email)->send(new AbandonedCartReminder(
            customerName: trim($cart->user->first_name . ' ' . $cart->user->last_name) ?: 'cher client',
            items: $cart->items,
            cartUrl: rtrim((string) config('app.frontend_url'), '/') . '/cart',
        ));

        Cart::query()
            ->whereKey($cart->id)
            ->where('updated_at', $cart->updated_at)
            ->whereNull('abandoned_reminder_sent_at')
            ->update(['abandoned_reminder_sent_at' => $now]);
    }
}
