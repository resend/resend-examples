/**
 * Audiences (Contacts & Segments) Example
 *
 * Demonstrates managing contacts and segments using Resend's Audiences API.
 * Useful for newsletters, marketing campaigns, and user management.
 *
 * Key concepts:
 * - Audiences contain contacts
 * - Contacts can have custom properties
 * - Segments group contacts by criteria
 *
 * @see https://resend.com/docs/dashboard/audiences/introduction
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ContactsList } from './contacts-list';

export default function AudiencesPage() {
  const contactsCode = `// List contacts in an audience
const { data: contacts } = await resend.contacts.list({
  audienceId: 'aud_123',
});

// Create a new contact
const { data: contact } = await resend.contacts.create({
  audienceId: 'aud_123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  unsubscribed: false,
});

// Update a contact
await resend.contacts.update({
  audienceId: 'aud_123',
  id: contact.id,
  firstName: 'Jane',
});

// Remove a contact
await resend.contacts.remove({
  audienceId: 'aud_123',
  id: contact.id,
});`;

  const segmentsCode = `// List segments in an audience
const { data: segments } = await resend.segments.list({
  audienceId: 'aud_123',
});

// Get contacts in a segment
const { data: contacts } = await resend.segments.contacts.list({
  audienceId: 'aud_123',
  segmentId: 'seg_456',
});

// Create a segment (via dashboard or API)
// Segments use rules to automatically group contacts
// Example: All contacts where firstName = 'John'`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Audiences"
        description="Manage contacts and segments for newsletters and marketing."
        sourcePath="src/app/audiences/page.tsx"
      />

      {/* Setup notice */}
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <p className="text-sm text-yellow-700">
          Create an audience in the{' '}
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Resend dashboard
          </a>{' '}
          first. Then add the audience ID to your environment variables.
        </p>
      </div>

      {/* Live contacts list */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Contacts</h2>
        <ContactsList />
      </div>

      {/* Contacts API */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Contacts API</h2>
        <CodeBlock code={contactsCode} title="Managing Contacts" />
      </div>

      {/* Segments API */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Segments API</h2>
        <CodeBlock code={segmentsCode} title="Working with Segments" />
      </div>

      {/* Features */}
      <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Audiences Features</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>Contacts:</strong> Store email addresses with optional
            first/last name and custom properties
          </li>
          <li>
            <strong>Segments:</strong> Automatically group contacts based on
            rules (e.g., subscribed users, specific domains)
          </li>
          <li>
            <strong>Unsubscribe handling:</strong> Track unsubscribed contacts
            to respect their preferences
          </li>
          <li>
            <strong>Bulk operations:</strong> Import/export contacts via CSV in
            the dashboard
          </li>
        </ul>
      </div>
    </main>
  );
}
