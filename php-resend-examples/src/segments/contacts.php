<?php
/**
 * Segments & Contacts Example
 *
 * Demonstrates managing contacts in a segment.
 *
 * @see https://resend.com/docs/api-reference/contacts/list-contacts
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$resend = Resend::client($_ENV['RESEND_API_KEY']);

$segmentId = $_ENV['RESEND_SEGMENT_ID'] ?? null;

if (!$segmentId) {
    echo "Error: RESEND_SEGMENT_ID not configured in .env\n";
    echo "Create a segment at https://resend.com/segments\n";
    exit(1);
}

try {
    // List all contacts in the segment
    echo "=== Listing Contacts ===\n\n";

    $contacts = $resend->contacts->list(['segment_id' => $segmentId]);

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
    // $newContact = $resend->contacts->create([
    //     'email' => 'newdelivered@resend.dev',
    //     'first_name' => 'John',
    //     'last_name' => 'Doe',
    //     'unsubscribed' => false,
    //     'segments' => [['id' => $segmentId]],
    // ]);
    // echo "Created contact: " . $newContact->id . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
