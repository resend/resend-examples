<?php

/**
 * Prevent Gmail Threading
 *
 * Gmail threads emails by subject and Message-ID/References headers.
 * Using X-Entity-Ref-ID with a unique value prevents threading,
 * ensuring each email appears as a separate conversation.
 *
 * Usage:
 *   php src/send/prevent_threading.php
 *
 * @see https://resend.com/docs/send-with-php
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Resend\Resend;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$resend = Resend::client($_ENV['RESEND_API_KEY']);

// Send multiple emails with the same subject
// They will NOT be threaded in Gmail
for ($i = 1; $i <= 3; $i++) {
    $result = $resend->emails->send([
        'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
        'to' => ['delivered@resend.dev'],
        'subject' => 'Order Confirmation', // Same subject each time
        'html' => "<p>This is email #{$i} - it will appear as a separate email.</p>",
        'headers' => [
            // Unique ID prevents Gmail from threading these emails together
            'X-Entity-Ref-ID' => bin2hex(random_bytes(16)),
        ],
    ]);

    echo "Email #{$i} sent: " . $result->id . "\n";
}

echo "\nAll emails sent! They will appear as separate conversations in Gmail.\n";
