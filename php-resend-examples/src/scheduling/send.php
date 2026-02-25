<?php
/**
 * Scheduled Email Example
 *
 * Demonstrates scheduling emails for future delivery.
 *
 * Key points:
 * - Maximum 7 days in the future
 * - Use ISO 8601 datetime format
 * - Scheduling NOT supported with batch sending
 * - Cancel scheduled emails with: $resend->emails->cancel($emailId)
 *
 * @see https://resend.com/docs/send-with-schedule
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

try {
    // Schedule for 5 minutes from now
    $scheduledTime = new DateTime('+5 minutes');

    $result = $resend->emails->send([
        'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
        'to' => ['delivered@resend.dev'],
        'subject' => 'Scheduled Email from PHP',
        'html' => '<h1>Hello from the future!</h1><p>This email was scheduled to be sent at a specific time.</p>',
        // The key parameter for scheduling
        'scheduled_at' => $scheduledTime->format('c'), // ISO 8601 format
    ]);

    echo "Email scheduled successfully!\n";
    echo "Email ID: " . $result->id . "\n";
    echo "Scheduled for: " . $scheduledTime->format('Y-m-d H:i:s') . "\n";
    echo "\nTo cancel: \$resend->emails->cancel('" . $result->id . "')\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
