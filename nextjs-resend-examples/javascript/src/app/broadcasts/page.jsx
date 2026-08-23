/**
 * Broadcasts Example
 *
 * Demonstrates the full lifecycle of a Resend broadcast: a one-time
 * campaign sent to a segment of your audience.
 *
 * Key concepts:
 * - A broadcast is created as a draft, then sent when it is ready
 * - Broadcasts target a segment, which groups contacts by rules
 * - Once sent, you can list recipients filtered by delivery event
 * - Sent broadcasts cannot be deleted or cancelled
 *
 * @see https://resend.com/docs/api-reference/broadcasts
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function BroadcastsPage() {
  const createCode = `import { resend } from '@/lib/resend';

// Segment to target (create one at resend.com/audiences)
const segmentId = process.env.RESEND_SEGMENT_ID ?? 'your-segment-id';

// Create it as a draft so you can review before sending
const { data: created, error } = await resend.broadcasts.create({
  name: 'August product update',
  segmentId,
  from: 'Acme <onboarding@resend.dev>',
  subject: 'Here is what shipped this month',
  html: '<p>Here is what is new in Acme this month...</p>',
});

if (error) {
  throw new Error(error.message);
}

const broadcastId = created.id;
console.log('Created broadcast:', broadcastId);`;

  const sendCode = `// Sending is a separate step from create, so drafts never go out by accident
const { data: sent, error } = await resend.broadcasts.send(broadcastId);

if (error) {
  throw new Error(error.message);
}

console.log('Sent broadcast:', sent.id);`;

  const recipientsCode = `// 'type' is required and selects which delivery event to list recipients for
const { data: recipients } = await resend.broadcasts.recipients(broadcastId, {
  type: 'sent',
});

console.log('Recipients:', recipients.data.length);
console.log('More pages available:', recipients.has_more);

for (const recipient of recipients.data) {
  // 'contact_id' is null when the recipient was not resolved to a contact
  console.log(recipient.email, recipient.contact_id);
}

// Page through the rest with 'after', using the last row's id as the cursor
if (recipients.has_more) {
  const last = recipients.data[recipients.data.length - 1];
  const { data: nextPage } = await resend.broadcasts.recipients(broadcastId, {
    type: 'sent',
    after: last.id,
  });

  console.log('Next page:', nextPage.data.length);
}`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Broadcasts"
        description="Send one-time campaigns to a segment and track who they reached."
        sourcePath="src/app/broadcasts/page.jsx"
      />

      {/* Setup notice */}
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <p className="text-sm text-yellow-700">
          Create an audience and a segment in the{' '}
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Resend dashboard
          </a>{' '}
          first, then add the segment id to your environment as{' '}
          <code className="bg-yellow-100 px-1 rounded">RESEND_SEGMENT_ID</code>.
          The snippets below are not executed on this page &mdash; they create
          and send a real broadcast, which cannot be undone.
        </p>
      </div>

      {/* Lifecycle */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            1. Create the broadcast
          </h2>
          <CodeBlock code={createCode} title="Creating a Broadcast" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">2. Send it</h2>
          <CodeBlock code={sendCode} title="Sending a Broadcast" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">3. List its recipients</h2>
          <CodeBlock
            code={recipientsCode}
            title="Listing Broadcast Recipients"
          />
        </div>
      </div>

      {/* Recipient event types */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Recipient Event Types</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
          <li>
            <strong>
              sent, delivered, complained, unsubscribed, suppressed:
            </strong>{' '}
            Return just the recipient&apos;s id, contact id, and email
          </li>
          <li>
            <strong>opened:</strong> Adds a <code>count</code> of how many times
            the recipient opened the broadcast
          </li>
          <li>
            <strong>clicked:</strong> Adds <code>count</code> and{' '}
            <code>clicked_links</code>, an array of{' '}
            <code>{'{ url, clicks }'}</code>
          </li>
          <li>
            <strong>bounced:</strong> Adds <code>bounce_type</code> (
            <code>permanent</code>, <code>transient</code>, or{' '}
            <code>undetermined</code>), optionally filterable via{' '}
            <code>bounceType</code>
          </li>
        </ul>
      </div>
    </main>
  );
}
