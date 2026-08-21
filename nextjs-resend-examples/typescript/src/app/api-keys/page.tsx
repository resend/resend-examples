/**
 * API Keys Example
 *
 * Demonstrates the full lifecycle of a Resend API key: creating one with a
 * scoped permission, renaming it, listing all keys, and removing it.
 *
 * Key concepts:
 * - The token is only ever returned once, at creation time
 * - Only the name can be changed after creation — permission and domain
 *   are fixed for the lifetime of the key
 * - There is no endpoint to retrieve a single key after creation, only list
 *
 * @see https://resend.com/docs/api-reference/api-keys
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function ApiKeysPage() {
  const createCode = `import { resend } from '@/lib/resend';

const { data: created, error } = await resend.apiKeys.create({
  name: 'Production Sending Key',
  permission: 'sending_access',
});

if (error) {
  throw new Error(error.message);
}

// The token is only shown here, at creation — store it now, it can't be
// retrieved again
console.log('Created:', created.id, 'token (shown once):', created.token);`;

  const updateCode = `// Only \`name\` is patchable. Never send permission or domainId here — a
// leaked key must not be able to widen another key's scope.
const { data: updated } = await resend.apiKeys.update(created.id, {
  name: 'Production Sending Key v2',
});

console.log('Renamed:', updated.id);`;

  const listCode = `// List every API key in the project
const { data: keys } = await resend.apiKeys.list();

console.log('Total keys:', keys.data.length);

// Tokens are never included in the list response — only id, name,
// permission, and creation date
for (const key of keys.data) {
  console.log(key.id, key.name, key.permission);
}`;

  const cleanupCode = `// Deleting an API key immediately revokes it — any requests made with
// it will start failing right away
const { data: deleted } = await resend.apiKeys.remove(created.id);

console.log('Deleted:', deleted.id);`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="API Keys"
        description="Create, rename, list, and delete API keys."
        sourcePath="src/app/api-keys/page.tsx"
      />

      {/* Lifecycle */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">1. Create a key</h2>
          <CodeBlock code={createCode} title="Creating an API Key" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">2. Rename it</h2>
          <CodeBlock code={updateCode} title="Updating an API Key" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">3. List all keys</h2>
          <CodeBlock code={listCode} title="Listing API Keys" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">4. Delete it</h2>
          <CodeBlock code={cleanupCode} title="Deleting an API Key" />
        </div>
      </div>

      {/* Permissions */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Permissions</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>full_access:</strong> Can send emails and manage every
            resource in the project
          </li>
          <li>
            <strong>sending_access:</strong> Can only send emails — scope it
            further to a single domain with <code>domainId</code>
          </li>
        </ul>
      </div>
    </main>
  );
}
