<script lang="ts">
  import PageHeader from "$lib/components/PageHeader.svelte";
</script>

<PageHeader
  title="Inbound Emails"
  description="Receive emails via webhooks and optionally forward them."
/>

<div class="content">
  <section class="setup-steps">
    <h2>Setup Steps</h2>
    <ol>
      <li>
        <strong>Configure your domain</strong>
        <p>Add an MX record pointing to Resend, or use your auto-assigned <code>@yourname.resend.app</code> address.</p>
      </li>
      <li>
        <strong>Create a webhook</strong>
        <p>
          In the <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer">Resend dashboard</a>,
          add a webhook for the <code>email.received</code> event.
        </p>
      </li>
      <li>
        <strong>Set up local testing</strong>
        <p>Use ngrok or similar to expose your local server:</p>
        <pre class="inline-pre">ngrok http 5173</pre>
      </li>
    </ol>
  </section>

  <section class="important-notes">
    <h2>Important Notes</h2>
    <ul>
      <li>Webhook payloads contain <strong>metadata only</strong>, not the email body</li>
      <li>Always verify webhook signatures to prevent spoofing</li>
      <li>Attachment download URLs expire after <strong>1 hour</strong></li>
      <li>Return a 200 status code or Resend will retry</li>
    </ul>
  </section>

  <details class="code-example">
    <summary>View webhook handler code</summary>
    <pre><code>{`// src/routes/api/webhook/+server.ts
import { json } from '@sveltejs/kit';
import { resend } from '$lib/server/resend';
import { RESEND_WEBHOOK_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();

  // IMPORTANT: Always verify webhook signatures!
  const event = resend.webhooks.verify({
    payload,
    headers: {
      id: request.headers.get('svix-id'),
      timestamp: request.headers.get('svix-timestamp'),
      signature: request.headers.get('svix-signature'),
    },
    webhookSecret: RESEND_WEBHOOK_SECRET,
  });

  if (event.type === 'email.received') {
    // Webhook contains metadata only, fetch the full email
    const { data: email } = await resend.emails.receiving.get(
      event.data.email_id,
    );

    console.log('Received from:', event.data.from);
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

  return json({ received: true });
};`}</code></pre>
  </details>

  <details class="code-example">
    <summary>View attachment handling code</summary>
    <pre><code>{`// Handling attachments from received emails
if (event.type === 'email.received') {
  const { data: attachments } =
    await resend.emails.receiving.attachments.list({
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
    }),
  );

  await resend.emails.send({
    from: 'System <system@yourdomain.com>',
    to: ['team@yourdomain.com'],
    subject: \`Fwd: \${email.subject}\`,
    html: email.html,
    attachments: forwardedAttachments,
  });
}`}</code></pre>
  </details>

  <section class="info-box">
    <h2>Local Development with ngrok</h2>
    <p>Since webhooks need to reach your server, use ngrok to expose your local dev server:</p>
    <ol>
      <li>Install ngrok: <code>brew install ngrok</code></li>
      <li>Start your dev server: <code>npm run dev</code></li>
      <li>Expose it: <code>ngrok http 5173</code></li>
      <li>Copy the HTTPS URL (e.g., <code>https://abc123.ngrok.io</code>)</li>
      <li>Add it as your webhook URL: <code>https://abc123.ngrok.io/api/webhook</code></li>
    </ol>
  </section>
</div>

<style>
  .content {
    max-width: 48rem;
  }

  section {
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.75rem;
  }

  p {
    color: #374151;
    line-height: 1.6;
    margin: 0 0 0.75rem;
  }

  ol {
    color: #374151;
    line-height: 1.8;
    padding-left: 1.25rem;
  }

  ol li {
    margin-bottom: 0.75rem;
  }

  ul {
    color: #374151;
    line-height: 1.8;
    padding-left: 1.25rem;
  }

  ul li {
    margin-bottom: 0.25rem;
  }

  code {
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.85rem;
  }

  .setup-steps {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.25rem;
  }

  .setup-steps a {
    color: #111827;
    text-decoration: underline;
  }

  .inline-pre {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    display: inline-block;
  }

  .important-notes {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 0.5rem;
    padding: 1.25rem;
  }

  .important-notes h2 {
    color: #92400e;
  }

  .important-notes ul {
    color: #a16207;
    list-style: disc;
  }

  .code-example {
    margin-bottom: 2rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  summary {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .code-example pre {
    margin: 0;
    padding: 1rem;
    background: #1f2937;
    color: #e5e7eb;
    font-size: 0.8rem;
    overflow-x: auto;
  }

  .code-example pre code {
    background: none;
    padding: 0;
    font-size: inherit;
  }

  .info-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.25rem;
  }

  .info-box code {
    background: #e5e7eb;
  }
</style>
