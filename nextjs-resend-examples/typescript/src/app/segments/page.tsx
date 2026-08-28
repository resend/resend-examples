/**
 * Segments (Contacts & Segments) Example
 *
 * Demonstrates managing contacts and segments using Resend's Segments API.
 * Useful for newsletters, marketing campaigns, and user management.
 *
 * Key concepts:
 * - Segments group contacts by criteria
 * - Contacts can have custom properties
 * - Contacts can belong to one or more segments
 *
 * @see https://resend.com/docs/dashboard/audiences/introduction
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ContactsList } from './contacts-list';

export default function SegmentsPage() {
  const contactsCode = `// List contacts in a segment
const { data: contacts } = await resend.contacts.list({
  segmentId: 'seg_123',
});

// Create a new contact
const { data: contact } = await resend.contacts.create({
  email: 'delivered@resend.dev',
  firstName: 'John',
  lastName: 'Doe',
  unsubscribed: false,
  segments: [{ id: 'seg_123' }],
});

// Update a contact
await resend.contacts.update({
  id: contact.id,
  firstName: 'Jane',
});

// Remove a contact
await resend.contacts.remove({
  id: contact.id,
});`;

  const segmentsCode = `// List all segments
const { data: segments } = await resend.segments.list();

// Create a segment
const { data: segment } = await resend.segments.create({
  name: 'Registered Users',
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Segments"
        description="Manage contacts and segments for newsletters and marketing."
        sourcePath="src/app/segments/page.tsx"
      />

      {/* Setup notice */}
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <p className="text-sm text-yellow-700">
          Create a segment in the{' '}
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Resend dashboard
          </a>{' '}
          first. Then add the segment ID to your environment variables.
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
        <h3 className="font-medium mb-3">Segments Features</h3>
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
