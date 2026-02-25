<?php
/**
 * Basic Email Sending Example
 *
 * Demonstrates the simplest way to send an email using Resend's PHP SDK.
 *
 * Usage: php src/send/basic.php
 *
 * @see https://resend.com/docs/send-with-php
 */

require_once __DIR__ . '/../../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

// Initialize the Resend client with your API key
$resend = Resend::client($_ENV['RESEND_API_KEY']);

try {
    // Send a basic email
    // The 'from' address must be from a verified domain
    $result = $resend->emails->send([
        'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
        'to' => ['delivered@resend.dev'], // Use test address for development
        'subject' => 'Hello from Resend PHP!',
        'html' => '<h1>Welcome!</h1><p>This email was sent using Resend\'s PHP SDK.</p>',
        // Optional: plain text version for accessibility
        'text' => 'Welcome! This email was sent using Resend\'s PHP SDK.',
    ]);

    echo "Email sent successfully!\n";
    echo "Email ID: " . $result->id . "\n";

} catch (Exception $e) {
    echo "Error sending email: " . $e->getMessage() . "\n";
    exit(1);
}
