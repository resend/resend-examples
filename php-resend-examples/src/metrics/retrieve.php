<?php
/**
 * Email Metrics Example
 *
 * Demonstrates retrieving account-level email metrics, broken down
 * by period and broadcast.
 *
 * @see https://resend.com/docs/api-reference/emails/get-metrics
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

$broadcastId = $argv[1] ?? null;

try {
    $params = [
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-08',
        'dimensions' => ['period', 'broadcast'],
    ];

    if ($broadcastId !== null) {
        $params['broadcast_id'] = [$broadcastId];
    }

    $metrics = $resend->emails->metrics($params);

    echo "=== Totals ===\n\n";
    foreach ($metrics->totals as $metric => $value) {
        echo "$metric: $value\n";
    }

    if (!empty($metrics->data)) {
        echo "\n=== Breakdown by period, broadcast ===\n\n";
        foreach ($metrics->data as $row) {
            echo "Period: " . $row['period'] . "\n";
            if (isset($row['broadcast_name'])) {
                echo "Broadcast: " . $row['broadcast_name'] . "\n";
            }
            echo "Sent: " . ($row['sent'] ?? 0) . "\n";
            echo "\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
