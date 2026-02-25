<?php
/**
 * Email with Attachments Example
 *
 * Demonstrates sending emails with file attachments.
 * Supports both URL-based and base64-encoded attachments.
 *
 * Key points:
 * - Maximum total attachment size: 40MB
 * - Attachments NOT supported with batch sending
 * - Use base64 encoding for content, or provide URL path
 *
 * @see https://resend.com/docs/send-with-attachments
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

try {
    // Create a sample file content
    $fileContent = "Sample Attachment\n" .
                   "==================\n\n" .
                   "This file was attached to your email.\n" .
                   "Sent at: " . date('Y-m-d H:i:s') . "\n";

    $result = $resend->emails->send([
        'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
        'to' => ['delivered@resend.dev'],
        'subject' => 'Email with Attachment',
        'html' => '<h1>Your attachment is ready</h1><p>Please find the file attached.</p>',
        'attachments' => [
            // Method 1: Base64-encoded content
            [
                'filename' => 'sample.txt',
                'content' => base64_encode($fileContent),
            ],
            // Method 2: URL path (Resend will fetch the file)
            // [
            //     'filename' => 'invoice.pdf',
            //     'path' => 'https://example.com/invoices/123.pdf',
            // ],
        ],
    ]);

    echo "Email with attachment sent!\n";
    echo "Email ID: " . $result->id . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
