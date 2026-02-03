<?php
/**
 * Batch Email Sending Example
 *
 * Demonstrates sending multiple emails in a single API call.
 * Useful for contact forms, notifications, and bulk operations.
 *
 * Key points:
 * - Maximum 100 emails per batch
 * - No attachments supported in batch
 * - No scheduling supported in batch
 * - If one email fails validation, entire batch fails
 *
 * @see https://resend.com/docs/api-reference/emails/send-batch-emails
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

try {
    // Batch send: multiple emails in one API call
    // Great for contact forms (confirmation + notification)
    $result = $resend->batch->send([
        // Email 1: Confirmation to user
        [
            'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
            'to' => ['user@example.com'],
            'subject' => 'We received your message',
            'html' => '<h1>Thanks for reaching out!</h1><p>We\'ll get back to you soon.</p>',
        ],
        // Email 2: Notification to team
        [
            'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
            'to' => [$_ENV['CONTACT_EMAIL'] ?? 'team@example.com'],
            'subject' => 'New contact form submission',
            'html' => '<h1>New message received</h1><p>From: user@example.com</p>',
        ],
    ]);

    echo "Batch sent successfully!\n";
    foreach ($result->data as $index => $email) {
        echo "Email " . ($index + 1) . " ID: " . $email->id . "\n";
    }

} catch (Exception $e) {
    echo "Error sending batch: " . $e->getMessage() . "\n";
    exit(1);
}
