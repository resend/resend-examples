<?php

/**
 * Resend Configuration
 *
 * This file configures the Resend Laravel integration.
 *
 * @see https://github.com/resend/resend-laravel
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Resend API Key
    |--------------------------------------------------------------------------
    |
    | Your Resend API key. Get it from https://resend.com/api-keys
    |
    */
    'api_key' => env('RESEND_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Secret
    |--------------------------------------------------------------------------
    |
    | Secret for verifying webhook signatures.
    | Get it from https://resend.com/webhooks
    |
    */
    'webhook_secret' => env('RESEND_WEBHOOK_SECRET'),
];
