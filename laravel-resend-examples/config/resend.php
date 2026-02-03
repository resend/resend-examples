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

    /*
    |--------------------------------------------------------------------------
    | Audience ID
    |--------------------------------------------------------------------------
    |
    | Default audience ID for contacts management.
    | Get it from https://resend.com/audiences
    |
    */
    'audience_id' => env('RESEND_AUDIENCE_ID'),

    /*
    |--------------------------------------------------------------------------
    | Confirm Redirect URL
    |--------------------------------------------------------------------------
    |
    | URL to redirect users to after confirming their subscription.
    | Used in double opt-in flow.
    |
    */
    'confirm_redirect_url' => env('CONFIRM_REDIRECT_URL', 'https://example.com/confirmed'),
];
