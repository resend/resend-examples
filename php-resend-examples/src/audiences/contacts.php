<?php
/**
 * Audiences & Contacts Example
 *
 * Demonstrates managing contacts in an audience.
 *
 * @see https://resend.com/docs/api-reference/contacts/list-contacts
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

$audienceId = $_ENV['RESEND_AUDIENCE_ID'] ?? null;

if (!$audienceId) {
    echo "Error: RESEND_AUDIENCE_ID not configured in .env\n";
    echo "Create an audience at https://resend.com/audiences\n";
    exit(1);
}

try {
    // List all contacts in the audience
    echo "=== Listing Contacts ===\n\n";

    $contacts = $resend->contacts->list($audienceId);

    foreach ($contacts->data as $contact) {
        echo "Email: " . $contact->email . "\n";
        if ($contact->first_name || $contact->last_name) {
            echo "Name: " . trim($contact->first_name . ' ' . $contact->last_name) . "\n";
        }
        echo "Subscribed: " . ($contact->unsubscribed ? 'No' : 'Yes') . "\n";
        echo "\n";
    }

    echo "Total contacts: " . count($contacts->data) . "\n";

    // Create a new contact (example)
    // $newContact = $resend->contacts->create($audienceId, [
    //     'email' => 'newdelivered@resend.dev',
    //     'first_name' => 'John',
    //     'last_name' => 'Doe',
    //     'unsubscribed' => false,
    // ]);
    // echo "Created contact: " . $newContact->id . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
