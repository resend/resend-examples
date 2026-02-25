<?php
/**
 * Inbound Email Webhook Handler
 *
 * Receives webhook events from Resend for inbound emails.
 * Deploy this file to a publicly accessible URL and register
 * it as a webhook endpoint in the Resend dashboard.
 *
 * For local development, use ngrok:
 *   ngrok http 8000
 *   Then register: https://abc123.ngrok.io/webhook.php
 *
 * @see https://resend.com/docs/receive-emails
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->safeLoad(); // Use safeLoad for webhook context

use Resend\Resend;

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get raw POST body
$payload = file_get_contents('php://input');

// Get Svix headers for verification
$svixId = $_SERVER['HTTP_SVIX_ID'] ?? null;
$svixTimestamp = $_SERVER['HTTP_SVIX_TIMESTAMP'] ?? null;
$svixSignature = $_SERVER['HTTP_SVIX_SIGNATURE'] ?? null;

// Verify all headers are present
if (!$svixId || !$svixTimestamp || !$svixSignature) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing webhook signature headers']);
    exit;
}

$webhookSecret = $_ENV['RESEND_WEBHOOK_SECRET'] ?? null;
if (!$webhookSecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Webhook secret not configured']);
    exit;
}

// Initialize Resend client
$resend = Resend::client($_ENV['RESEND_API_KEY']);

try {
    // Verify webhook signature (CRITICAL for security!)
    $event = $resend->webhooks->verify([
        'payload' => $payload,
        'headers' => [
            'svix-id' => $svixId,
            'svix-timestamp' => $svixTimestamp,
            'svix-signature' => $svixSignature,
        ],
        'secret' => $webhookSecret,
    ]);

    // Handle different event types
    switch ($event->type) {
        case 'email.received':
            // New inbound email!
            error_log("New email from: " . $event->data->from);
            error_log("Subject: " . $event->data->subject);

            // Webhook only has metadata - fetch full content
            $email = $resend->emails->receiving->get($event->data->email_id);
            error_log("Body: " . ($email->text ?? $email->html));

            // Optional: Forward the email
            // $resend->emails->send([
            //     'from' => 'System <system@yourdomain.com>',
            //     'to' => ['team@yourdomain.com'],
            //     'subject' => 'Fwd: ' . $event->data->subject,
            //     'html' => $email->html ?? $email->text,
            // ]);
            break;

        case 'email.delivered':
            error_log("Email delivered: " . $event->data->email_id);
            break;

        case 'email.bounced':
            error_log("Email bounced: " . $event->data->email_id);
            // Remove from mailing list, alert user, etc.
            break;

        case 'email.complained':
            error_log("Spam complaint: " . $event->data->email_id);
            // Unsubscribe user immediately!
            break;

        default:
            error_log("Unhandled event: " . $event->type);
    }

    // Return 200 to acknowledge receipt
    http_response_code(200);
    echo json_encode(['received' => true, 'type' => $event->type]);

} catch (Exception $e) {
    error_log("Webhook error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
