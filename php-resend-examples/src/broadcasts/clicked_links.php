<?php
/**
 * Broadcast Clicked Links Example
 *
 * Demonstrates listing the links clicked in a broadcast, ranked by total
 * clicks, with cursor-based pagination.
 *
 * @see https://resend.com/docs/api-reference/broadcasts/list-broadcast-clicked-links
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

use Resend\Resend;

$resend = Resend::client($_ENV['RESEND_API_KEY']);

$broadcastId = $_ENV['RESEND_BROADCAST_ID'] ?? null;

if (!$broadcastId) {
    echo "Error: RESEND_BROADCAST_ID not configured in .env\n";
    echo "Find a broadcast ID at https://resend.com/broadcasts\n";
    exit(1);
}

try {
    // List the first page of clicked links
    echo "=== Broadcast Clicked Links ===\n\n";

    $clickedLinks = $resend->broadcasts->clickedLinks->list($broadcastId, [
        'limit' => 10,
    ]);

    foreach ($clickedLinks->data as $link) {
        echo "URL: " . $link->url . "\n";
        echo "Clicks: " . $link->clicks . "\n";
        echo "Unique clicks: " . $link->unique_clicks . "\n";
        echo "\n";
    }

    echo "Total links on this page: " . count($clickedLinks->data) . "\n";

    // Fetch the next page, using the last row's opaque cursor `id` — it does
    // not identify any entity, it's only meaningful for pagination
    if ($clickedLinks->has_more && count($clickedLinks->data) > 0) {
        $lastId = end($clickedLinks->data)->id;

        echo "\n=== Next Page ===\n\n";

        $nextPage = $resend->broadcasts->clickedLinks->list($broadcastId, [
            'limit' => 10,
            'after' => $lastId,
        ]);

        foreach ($nextPage->data as $link) {
            echo "URL: " . $link->url . " (" . $link->clicks . " clicks)\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
