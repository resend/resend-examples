<?php

/**
 * Double Opt-In: Subscribe
 *
 * Creates a contact with unsubscribed: true and sends a confirmation email.
 * The contact remains unsubscribed until they click the confirmation link,
 * which triggers the email.clicked webhook.
 *
 * Usage:
 *   php src/double-optin/subscribe.php delivered@resend.dev "John Doe"
 *
 * @see https://resend.com/docs/api-reference/contacts/create-contact
 */

require_once __DIR__ . '/../../vendor/autoload.php';

use Resend\Resend;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$resend = Resend::client($_ENV['RESEND_API_KEY']);

$email = $argv[1] ?? null;
$name = $argv[2] ?? null;

if (!$email) {
    echo "Usage: php src/double-optin/subscribe.php <email> [name]\n";
    exit(1);
}

$audienceId = $_ENV['RESEND_AUDIENCE_ID'] ?? null;
if (!$audienceId) {
    echo "Error: RESEND_AUDIENCE_ID environment variable is required\n";
    exit(1);
}

$confirmUrl = $_ENV['CONFIRM_REDIRECT_URL'] ?? 'https://example.com/confirmed';

echo "=== Double Opt-In: Subscribe ===\n\n";

try {
    // Step 1: Create contact with unsubscribed: true (pending confirmation)
    echo "Creating contact: {$email}...\n";
    $contact = $resend->contacts->create([
        'audience_id' => $audienceId,
        'email' => $email,
        'first_name' => $name,
        'unsubscribed' => true, // Will be set to false when they confirm
    ]);
    echo "Contact created: {$contact->id}\n";
    echo "Status: Pending confirmation (unsubscribed: true)\n\n";

    // Step 2: Send confirmation email with trackable link
    echo "Sending confirmation email...\n";
    $welcomeText = $name ? "Welcome, {$name}!" : "Welcome!";

    $result = $resend->emails->send([
        'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
        'to' => [$email],
        'subject' => 'Confirm your subscription',
        'html' => <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #333; margin-bottom: 10px;">{$welcomeText}</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Please confirm your subscription to our newsletter by clicking the button below.
            </p>
            <a href="{$confirmUrl}"
               style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Subscription
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request this subscription, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
        HTML,
    ]);

    echo "Confirmation email sent!\n";
    echo "Email ID: {$result->id}\n\n";
    echo "Next steps:\n";
    echo "1. Check inbox for confirmation email\n";
    echo "2. Click the confirmation link\n";
    echo "3. Webhook will update contact to unsubscribed: false\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
