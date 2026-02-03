/**
 * Inbound Email Example
 *
 * Demonstrates receiving and forwarding emails using Resend's
 * inbound email feature and webhooks.
 *
 * Key concepts:
 * - Webhooks notify you when emails arrive
 * - Webhook payload contains metadata, not the email body
 * - Use resend.emails.receiving.get() to fetch the full content
 * - Forward emails by combining receive + send
 *
 * @see https://resend.com/docs/receive-emails
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function InboundPage() {
  const webhookCode = `// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  const payload = await request.text();

  // IMPORTANT: Always verify webhook signatures!
  const event = resend.webhooks.verify({
    payload,
    headers: {
      'svix-id': request.headers.get('svix-id'),
      'svix-timestamp': request.headers.get('svix-timestamp'),
      'svix-signature': request.headers.get('svix-signature'),
    },
    secret: process.env.RESEND_WEBHOOK_SECRET,
  });

  if (event.type === 'email.received') {
    // Webhook contains metadata only, fetch the full email
    const { data: email } = await resend.emails.receiving.get(
      event.data.email_id
    );

    console.log('Received email:');
    console.log('From:', event.data.from);
    console.log('Subject:', email.subject);
    console.log('Body:', email.html || email.text);

    // Optional: Forward the email
    await resend.emails.send({
      from: 'System <system@yourdomain.com>',
      to: ['team@yourdomain.com'],
      subject: \`Fwd: \${email.subject}\`,
      html: email.html,
    });
  }

  return NextResponse.json({ received: true });
}`;

  const attachmentCode = `// Handling attachments from received emails
if (event.type === 'email.received') {
  // Get attachment metadata and download URLs
  const { data: attachments } = await resend.emails.receiving.attachments.list({
    emailId: event.data.email_id,
  });

  // Download and forward attachments
  const forwardedAttachments = await Promise.all(
    attachments.map(async (att) => {
      // Download URLs expire after 1 hour
      const res = await fetch(att.download_url);
      const buffer = Buffer.from(await res.arrayBuffer());
      return {
        filename: att.filename,
        content: buffer.toString('base64'),
      };
    })
  );

  // Forward with attachments
  await resend.emails.send({
    from: 'System <system@yourdomain.com>',
    to: ['team@yourdomain.com'],
    subject: \`Fwd: \${email.subject}\`,
    html: email.html,
    attachments: forwardedAttachments,
  });
}`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Inbound Emails"
        description="Receive emails via webhooks and optionally forward them."
        sourcePath="src/app/inbound/page.tsx"
      />

      {/* Setup Instructions */}
      <div className="mb-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h2 className="font-semibold mb-3">Setup Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <strong>Configure your domain</strong>
            <p className="ml-5 mt-1">
              Add an MX record pointing to Resend, or use your auto-assigned
              <code className="bg-[var(--background)] px-1 mx-1 rounded">
                @yourname.resend.app
              </code>
              address.
            </p>
          </li>
          <li>
            <strong>Create a webhook</strong>
            <p className="ml-5 mt-1">
              In the{' '}
              <a
                href="https://resend.com/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Resend dashboard
              </a>
              , add a webhook for the{' '}
              <code className="bg-[var(--background)] px-1 mx-1 rounded">
                email.received
              </code>{' '}
              event.
            </p>
          </li>
          <li>
            <strong>Set up local testing</strong>
            <p className="ml-5 mt-1">
              Use ngrok or similar to expose your local server:
            </p>
            <pre className="ml-5 mt-2 p-2 bg-[var(--background)] rounded text-xs">
              ngrok http 3000 # Use the HTTPS URL as your webhook endpoint
            </pre>
          </li>
        </ol>
      </div>

      {/* Important notes */}
      <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Important Notes</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • Webhook payloads contain <strong>metadata only</strong>, not the
            email body
          </li>
          <li>• Always verify webhook signatures to prevent spoofing</li>
          <li>
            • Attachment download URLs expire after <strong>1 hour</strong>
          </li>
          <li>• Return a 200 status code or Resend will retry</li>
        </ul>
      </div>

      {/* Webhook handler code */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Webhook Handler</h2>
        <CodeBlock code={webhookCode} title="src/app/api/webhook/route.ts" />
      </div>

      {/* Attachment handling */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Handling Attachments</h2>
        <CodeBlock code={attachmentCode} title="Forwarding with Attachments" />
      </div>

      {/* Local testing with ngrok */}
      <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">Local Development with ngrok</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          Since webhooks need to reach your server, use ngrok to expose your
          local dev server:
        </p>
        <ol className="text-sm text-[var(--muted-foreground)] list-decimal list-inside space-y-2">
          <li>
            Install ngrok:{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              brew install ngrok
            </code>
          </li>
          <li>
            Start your dev server:{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              pnpm dev
            </code>
          </li>
          <li>
            Expose it:{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              ngrok http 3000
            </code>
          </li>
          <li>
            Copy the HTTPS URL (e.g.,{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              https://abc123.ngrok.io
            </code>
            )
          </li>
          <li>
            Add it as your webhook URL in Resend:{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              https://abc123.ngrok.io/api/webhook
            </code>
          </li>
        </ol>
      </div>
    </main>
  );
}
