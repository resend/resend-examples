<script setup>
// Inbound email page - documentation for handling inbound emails with Resend
</script>

<template>
  <div>
    <PageHeader
      title="Inbound Emails"
      description="Receive emails via webhooks and optionally forward them."
    />

    <div class="setup-steps">
      <h3>Setup Steps</h3>
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
          <pre class="inline-pre">ngrok http 3000</pre>
        </li>
      </ol>
    </div>

    <div class="important-notes">
      <h3>Important Notes</h3>
      <ul>
        <li>Webhook payloads contain <strong>metadata only</strong>, not the email body</li>
        <li>Always verify webhook signatures to prevent spoofing</li>
        <li>Attachment download URLs expire after <strong>1 hour</strong></li>
        <li>Return a 200 status code or Resend will retry</li>
      </ul>
    </div>

    <div class="code-example">
      <h3>Webhook Handler</h3>
      <pre><code>// server/api/webhook.post.js
import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const payload = await readRawBody(event);

  // IMPORTANT: Always verify webhook signatures!
  const verified = resend.webhooks.verify({
    payload,
    headers: {
      id: getHeader(event, "svix-id"),
      timestamp: getHeader(event, "svix-timestamp"),
      signature: getHeader(event, "svix-signature"),
    },
    webhookSecret: config.resendWebhookSecret,
  });

  if (verified.type === "email.received") {
    // Webhook contains metadata only, fetch the full email
    const { data: email } = await resend.emails.receiving.get(
      verified.data.email_id,
    );

    console.log("Received from:", verified.data.from);
    console.log("Subject:", email.subject);
    console.log("Body:", email.html || email.text);

    // Optional: Forward the email
    await resend.emails.send({
      from: "System &lt;system@yourdomain.com&gt;",
      to: ["team@yourdomain.com"],
      subject: `Fwd: ${email.subject}`,
      html: email.html,
    });
  }

  return { received: true };
});</code></pre>
    </div>

    <div class="code-example">
      <h3>Handling Attachments</h3>
      <pre><code>// Handling attachments from received emails
if (verified.type === "email.received") {
  const { data: attachments } =
    await resend.emails.receiving.attachments.list({
      emailId: verified.data.email_id,
    });

  // Download and forward attachments
  const forwardedAttachments = await Promise.all(
    attachments.map(async (att) => {
      // Download URLs expire after 1 hour
      const res = await fetch(att.download_url);
      const buffer = Buffer.from(await res.arrayBuffer());
      return {
        filename: att.filename,
        content: buffer.toString("base64"),
      };
    }),
  );

  await resend.emails.send({
    from: "System &lt;system@yourdomain.com&gt;",
    to: ["team@yourdomain.com"],
    subject: `Fwd: ${email.subject}`,
    html: email.html,
    attachments: forwardedAttachments,
  });
}</code></pre>
    </div>

    <div class="info-section">
      <h3>Local Development with ngrok</h3>
      <p>Since webhooks need to reach your server, use ngrok to expose your local dev server:</p>
      <ol>
        <li>Install ngrok: <code>brew install ngrok</code></li>
        <li>Start your dev server: <code>npm run dev</code></li>
        <li>Expose it: <code>ngrok http 3000</code></li>
        <li>Copy the HTTPS URL (e.g., <code>https://abc123.ngrok.io</code>)</li>
        <li>Add it as your webhook URL: <code>https://abc123.ngrok.io/api/webhook</code></li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.setup-steps {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.setup-steps h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.setup-steps ol {
  padding-left: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.8;
}

.setup-steps ol li {
  margin-bottom: 0.75rem;
}

.setup-steps p {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.setup-steps code {
  background: #f4f4f5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.8rem;
}

.setup-steps a {
  color: #18181b;
  text-decoration: underline;
}

.inline-pre {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
}

.important-notes {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.important-notes h3 {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.important-notes ul {
  list-style: disc;
  padding-left: 1.25rem;
  font-size: 0.875rem;
  color: #a16207;
}

.important-notes ul li {
  margin-bottom: 0.25rem;
}

.code-example {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.code-example h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.code-example pre {
  background: #f4f4f5;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.5;
}

.info-section {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.info-section p {
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.info-section ol {
  padding-left: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.8;
}

.info-section ol li {
  margin-bottom: 0.5rem;
}

.info-section code {
  background: #f4f4f5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.8rem;
}
</style>
