<?php

/**
 * Double Opt-In: Webhook Handler
 *
 * Handles the email.clicked event to confirm subscriptions.
 * When a user clicks the confirmation link, this webhook:
 * 1. Verifies the webhook signature
 * 2. Finds the contact by email
 * 3. Updates the contact to unsubscribed: false
 *
 * Deploy this to a public URL and register it in the Resend dashboard.
 *
 * @see https://resend.com/docs/dashboard/webhooks/introduction
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Resend\Resend;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$resend = Resend::client($_ENV['RESEND_API_KEY']);

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');

$payload = file_get_contents('php://input');

// Get Svix headers
$svixId = $_SERVER['HTTP_SVIX_ID'] ?? null;
$svixTimestamp = $_SERVER['HTTP_SVIX_TIMESTAMP'] ?? null;
$svixSignature = $_SERVER['HTTP_SVIX_SIGNATURE'] ?? null;

if (!$svixId || !$svixTimestamp || !$svixSignature) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing webhook headers']);
    exit;
}

$webhookSecret = $_ENV['RESEND_WEBHOOK_SECRET'] ?? null;
if (!$webhookSecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Webhook secret not configured']);
    exit;
}

try {
    // Verify webhook signature
    $event = $resend->webhooks->verify([
        'payload' => $payload,
        'headers' => [
            'svix-id' => $svixId,
            'svix-timestamp' => $svixTimestamp,
            'svix-signature' => $svixSignature,
        ],
        'secret' => $webhookSecret,
    ]);

    // Only process email.clicked events
    if ($event['type'] !== 'email.clicked') {
        echo json_encode([
            'received' => true,
            'type' => $event['type'],
            'message' => 'Event ignored',
        ]);
        exit;
    }

    $audienceId = $_ENV['RESEND_AUDIENCE_ID'] ?? null;
    if (!$audienceId) {
        http_response_code(500);
        echo json_encode(['error' => 'RESEND_AUDIENCE_ID not configured']);
        exit;
    }

    // Get recipient email from webhook data
    $recipientEmail = $event['data']['to'][0] ?? null;
    if (!$recipientEmail) {
        http_response_code(400);
        echo json_encode(['error' => 'No recipient email in webhook data']);
        exit;
    }

    error_log("Confirmation click received for: {$recipientEmail}");

    // Find contact by email
    $contacts = $resend->contacts->list($audienceId);
    $contact = null;
    foreach ($contacts->data as $c) {
        if ($c->email === $recipientEmail) {
            $contact = $c;
            break;
        }
    }

    if (!$contact) {
        http_response_code(404);
        echo json_encode(['error' => 'Contact not found']);
        exit;
    }

    // Update contact to confirmed (unsubscribed: false)
    $resend->contacts->update($audienceId, $contact->id, [
        'unsubscribed' => false,
    ]);

    error_log("Contact confirmed: {$recipientEmail} ({$contact->id})");

    echo json_encode([
        'received' => true,
        'type' => $event['type'],
        'confirmed' => true,
        'email' => $recipientEmail,
        'contact_id' => $contact->id,
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
