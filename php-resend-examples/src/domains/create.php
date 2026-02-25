<?php
/**
 * Domain Management Example
 *
 * Demonstrates creating a domain and retrieving DNS records.
 *
 * @see https://resend.com/docs/api-reference/domains/create-domain
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

$domainName = $argv[1] ?? 'notifications.example.com';

try {
    // Create a new domain
    $domain = $resend->domains->create([
        'name' => $domainName,
        // Optional: specify region
        // 'region' => 'us-east-1',
    ]);

    echo "Domain created successfully!\n";
    echo "ID: " . $domain->id . "\n";
    echo "Name: " . $domain->name . "\n";
    echo "Status: " . $domain->status . "\n";
    echo "\n";

    // Display required DNS records
    echo "=== Required DNS Records ===\n\n";

    foreach ($domain->records as $record) {
        echo "Type: " . $record->type . "\n";
        echo "Name: " . $record->name . "\n";
        echo "Value: " . $record->value . "\n";
        if (isset($record->priority)) {
            echo "Priority: " . $record->priority . "\n";
        }
        echo "\n";
    }

    echo "Add these records to your DNS provider to verify your domain.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
