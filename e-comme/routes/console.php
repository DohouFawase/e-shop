<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id || $user->id === $id; // selon UUID ou int
});
// Le rappel part à partir de J+3; chaque job vide le panier à partir de J+7.
Schedule::command('carts:process-abandoned')->hourly()->withoutOverlapping();
