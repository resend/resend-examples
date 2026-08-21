<?php
/**
 * API Keys Lifecycle Example
 *
 * Demonstrates the full lifecycle of an API key: create it, rename it,
 * list all keys, then delete it. There is no endpoint to retrieve a
 * single API key, so only its id, name, created_at and last_used_at are
 * available afterwards via the list endpoint.
 *
 * @see https://resend.com/docs/api-reference/api-keys
 */

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$resend = Resend::client($_ENV['RESEND_API_KEY']);

try {
    // 1. Create the API key. The token is only ever returned here - store it
    // securely, it cannot be retrieved again.
    echo "=== Creating API Key ===\n\n";

    $created = $resend->apiKeys->create([
        'name' => 'My Key',
        'permission' => 'full_access',
    ]);

    echo "Created API key: " . $created->id . "\n";
    echo "Token (shown once): " . $created->token . "\n\n";

    // 2. Rename it. Only `name` is honored by this endpoint - permission and
    // domain_id are ignored, so a leaked key can never widen another key's
    // scope through a rename.
    echo "=== Updating API Key ===\n\n";

    $updated = $resend->apiKeys->update($created->id, [
        'name' => 'New Name',
    ]);

    echo "Updated API key: " . $updated->id . "\n\n";

    // 3. List every API key
    echo "=== Listing API Keys ===\n\n";

    $list = $resend->apiKeys->list();

    foreach ($list->data as $key) {
        echo "  " . $key->id . " - " . $key->name . " (created: " . $key->created_at . ", last used: " . ($key->last_used_at ?? 'never') . ")\n";
    }
    echo "\n";

    // 4. Clean up
    echo "=== Deleting API Key ===\n\n";

    $resend->apiKeys->remove($created->id);

    echo "Deleted API key: " . $created->id . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
