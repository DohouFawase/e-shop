<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAbandonedCart;
use App\Models\Boutique\Cart;
use Illuminate\Console\Command;

class DispatchAbandonedCartJobs extends Command
{
    protected $signature = 'carts:process-abandoned {--cart= : Ne traiter qu’un panier donné, pour un test local}';

    protected $description = 'Planifie le rappel et le nettoyage des paniers abandonnés';

    public function handle(): int
    {
        $cutoff = now()->subDays(3);
        $dispatched = 0;

        Cart::query()
            ->when($this->option('cart'), fn ($query, $cartId) => $query->whereKey($cartId))
            ->where('updated_at', '<=', $cutoff)
            ->whereHas('items')
            ->where(function ($query): void {
                $query->whereNull('abandoned_reminder_sent_at')
                    ->orWhere('updated_at', '<=', now()->subDays(7));
            })
            ->whereHas('user', fn ($query) => $query->whereNotNull('email')->where('email', '!=', ''))
            ->with('user')
            ->orderBy('id')
            ->chunkById(200, function ($carts) use (&$dispatched): void {
                foreach ($carts as $cart) {
                    $timezone = $cart->user->timezone ?: 'Africa/Abidjan';
                    if (now($timezone)->format('G') !== '9') {
                        continue;
                    }
                    ProcessAbandonedCart::dispatch($cart->id);
                    $dispatched++;
                }
            });

        $this->info("{$dispatched} traitement(s) de panier abandonné(s) ajouté(s) à la file.");

        return self::SUCCESS;
    }
}
