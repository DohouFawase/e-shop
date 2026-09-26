<?php

return [
    // CONTACT_EMAIL peut être distincte, sinon on réutilise l’adresse d’envoi configurée.
    'email' => env('CONTACT_EMAIL') ?: env('MAIL_FROM_ADDRESS'),
];
