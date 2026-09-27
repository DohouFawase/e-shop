<?php

$frontendUrl = trim((string) env('FRONTEND_URL', 'http://localhost:3000'));
$frontendOrigin = parse_url($frontendUrl, PHP_URL_SCHEME) && parse_url($frontendUrl, PHP_URL_HOST)
    ? parse_url($frontendUrl, PHP_URL_SCHEME).'://'.parse_url($frontendUrl, PHP_URL_HOST).(parse_url($frontendUrl, PHP_URL_PORT) ? ':'.parse_url($frontendUrl, PHP_URL_PORT) : '')
    : $frontendUrl;

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_filter([
        $frontendOrigin,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
