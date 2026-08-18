<?php
/**
 * Automations Lifecycle Example
 *
 * Demonstrates the full lifecycle of a "Welcome series" automation: create it
 * disabled, enable it, read back its steps and connections, list automations,
 * inspect its runs, then stop and delete it.
 *
 * @see https://resend.com/docs/api-reference/automations
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$resend = Resend::client($_ENV['RESEND_API_KEY']);

// The send_email step needs a published template. Create one at
// https://resend.com/templates and set RESEND_TEMPLATE_ID in .env
$templateId = $_ENV['RESEND_TEMPLATE_ID'] ?? 'your-template-id';

try {
    // 1. Create the automation, disabled so it does not run while we build it
    echo "=== Creating Automation ===\n\n";

    $created = $resend->automations->create([
        'name' => 'Welcome series',
        'status' => 'disabled',
        'steps' => [
            [
                'key' => 'start',
                'type' => 'trigger',
                'config' => ['event_name' => 'user.created'],
            ],
            [
                'key' => 'welcome',
                'type' => 'send_email',
                'config' => [
                    'template' => ['id' => $templateId],
                ],
            ],
        ],
        'connections' => [
            ['from' => 'start', 'to' => 'welcome'],
        ],
    ]);

    $automationId = $created->id;

    echo "Created automation: " . $automationId . "\n\n";

    // 2. Enable it so the trigger starts accepting events
    echo "=== Enabling Automation ===\n\n";

    $updated = $resend->automations->update($automationId, [
        'status' => 'enabled',
    ]);

    echo "Updated automation " . $updated->id . " to status: " . $updated->status . "\n\n";

    // 3. Read it back to inspect the graph
    echo "=== Retrieving Automation ===\n\n";

    $automation = $resend->automations->get($automationId);

    echo "Name: " . $automation->name . "\n";
    echo "Status: " . $automation->status . "\n";

    echo "Steps:\n";
    foreach ($automation->steps as $step) {
        echo "  " . $step['key'] . " (" . $step['type'] . ")\n";
    }

    echo "Connections:\n";
    foreach ($automation->connections as $connection) {
        echo "  " . $connection['from'] . " -> " . $connection['to'] . "\n";
    }
    echo "\n";

    // 4. List every automation, then narrow the list by status
    echo "=== Listing Automations ===\n\n";

    $automations = $resend->automations->list();

    echo "Total automations: " . count($automations->data) . "\n";
    echo "Has more: " . ($automations->has_more ? 'Yes' : 'No') . "\n";

    $enabled = $resend->automations->list([
        'status' => 'enabled',
        'limit' => 10,
    ]);

    echo "Enabled automations: " . count($enabled->data) . "\n\n";

    // 5. List the runs for this automation
    echo "=== Listing Runs ===\n\n";

    $runs = $resend->automations->runs->list($automationId);

    echo "Total runs: " . count($runs->data) . "\n\n";

    // 6. Inspect the first run. A freshly created automation has no runs yet,
    // so only fetch one once the trigger event has actually fired.
    if (count($runs->data) > 0) {
        echo "=== Retrieving Run ===\n\n";

        $run = $resend->automations->runs->get($automationId, $runs->data[0]->id);

        echo "Run: " . $run->id . "\n";
        echo "Status: " . $run->status . "\n";

        echo "Step statuses:\n";
        foreach ($run->steps as $runStep) {
            echo "  " . $runStep['key'] . " (" . $runStep['type'] . "): " . $runStep['status'] . "\n";
        }
        echo "\n";
    } else {
        echo "No runs yet - runs appear once a user.created event triggers the automation.\n\n";
    }

    // 7. Stop the automation, halting in-flight runs
    echo "=== Stopping Automation ===\n\n";

    $stopped = $resend->automations->stop($automationId);

    echo "Stopped automation " . $stopped->id . ", status: " . $stopped->status . "\n\n";

    // 8. Clean up
    echo "=== Deleting Automation ===\n\n";

    $deleted = $resend->automations->remove($automationId);

    echo "Deleted automation " . $deleted->id . ": " . ($deleted->deleted ? 'Yes' : 'No') . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
