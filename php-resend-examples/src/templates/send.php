<?php
/**
 * Resend Templates Example
 *
 * Demonstrates using Resend's hosted templates feature.
 *
 * Key points:
 * - Create templates in the Resend dashboard
 * - Variable names are CASE-SENSITIVE
 * - Templates must be published before use
 * - Cannot combine template with html/text parameters
 *
 * @see https://resend.com/docs/dashboard/templates/introduction
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

// Replace with your actual template ID from Resend dashboard
$templateId = 'tmpl_xxxxxxxx';

try {
    $result = $resend->emails->send([
        'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
        'to' => ['delivered@resend.dev'],
        'subject' => 'Order Confirmation', // Can be overridden by template
        'template' => [
            'id' => $templateId,
            // Variables must match EXACTLY (case-sensitive!)
            'variables' => [
                'USER_NAME' => 'John Doe',
                'ORDER_TOTAL' => '$99.00',
                'ORDER_NUMBER' => 'ORD-12345',
            ],
        ],
    ]);

    echo "Email sent with template!\n";
    echo "Email ID: " . $result->id . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nMake sure to:\n";
    echo "1. Create a template in the Resend dashboard\n";
    echo "2. Publish the template\n";
    echo "3. Update the \$templateId variable with your template ID\n";
    exit(1);
}
