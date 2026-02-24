/**
 * Inbound Email Example
 *
 * Demonstrates receiving and forwarding emails using Resend's
 * inbound email feature and webhooks.
 *
 * @see https://resend.com/docs/receive-emails
 */

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/inbound')({
  component: InboundPage,
});

function InboundPage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: '#666' }}>&larr; Back to examples</a>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Inbound Emails</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Receive emails via webhooks and optionally forward them.</p>

      <div style={{ marginBottom: 32, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Setup Steps</h2>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#666', lineHeight: 2 }}>
          <li>
            <strong>Configure your domain</strong>
            <p style={{ margin: '4px 0 8px' }}>
              Add an MX record pointing to Resend, or use your auto-assigned <code>@yourname.resend.app</code> address.
            </p>
          </li>
          <li>
            <strong>Create a webhook</strong>
            <p style={{ margin: '4px 0 8px' }}>
              In the <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer">Resend dashboard</a>, add a webhook for the <code>email.received</code> event.
            </p>
          </li>
          <li>
            <strong>Set up local testing</strong>
            <p style={{ margin: '4px 0 8px' }}>
              Use ngrok or similar to expose your local server:
            </p>
            <pre style={{ background: '#fff', padding: 8, borderRadius: 4, fontSize: 13 }}>ngrok http 3000</pre>
          </li>
        </ol>
      </div>

      <div style={{ marginBottom: 32, padding: 16, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8, color: '#92400e' }}>Important Notes</h3>
        <ul style={{ fontSize: 14, color: '#a16207', margin: 0, paddingLeft: 20 }}>
          <li>Webhook payloads contain <strong>metadata only</strong>, not the email body</li>
          <li>Always verify webhook signatures to prevent spoofing</li>
          <li>Attachment download URLs expire after <strong>1 hour</strong></li>
          <li>Return a 200 status code or Resend will retry</li>
        </ul>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Webhook Handler</h2>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto', lineHeight: 1.6 }}>
{`// src/routes/api/webhook.js
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/webhook')({
  POST: async ({ request }) => {
    const payload = await request.text();

    // IMPORTANT: Always verify webhook signatures!
    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get('svix-id'),
        timestamp: request.headers.get('svix-timestamp'),
        signature: request.headers.get('svix-signature'),
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    });

    if (event.type === 'email.received') {
      // Fetch the full email content
      const { data: email } = await resend.emails.receiving.get(
        event.data.email_id
      );

      console.log('From:', event.data.from);
      console.log('Body:', email?.html || email?.text);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
});`}
        </pre>
      </div>

      <div style={{ padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8 }}>Local Development with ngrok</h3>
        <ol style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li>Install ngrok: <code>brew install ngrok</code></li>
          <li>Start your dev server: <code>npm run dev</code></li>
          <li>Expose it: <code>ngrok http 3000</code></li>
          <li>Copy the HTTPS URL (e.g., <code>https://abc123.ngrok.io</code>)</li>
          <li>Add it as your webhook URL: <code>https://abc123.ngrok.io/api/webhook</code></li>
        </ol>
      </div>
    </main>
  );
}
