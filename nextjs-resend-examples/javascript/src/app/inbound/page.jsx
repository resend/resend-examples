import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';

export default function InboundPage() {
  const webhookCode = `// src/app/api/webhook/route.js
import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request) {
  const payload = await request.text();

  // Always verify webhook signatures!
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
    // Fetch full email content
    const { data: email } = await resend.emails.receiving.get(
      event.data.email_id
    );
    console.log('Body:', email.html || email.text);
  }

  return NextResponse.json({ received: true });
}`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Inbound Emails"
        description="Receive and forward emails via webhooks."
        sourcePath="src/app/inbound/page.jsx"
      />

      <div className="mb-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h2 className="font-semibold mb-3">Setup Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>Configure your domain with MX records pointing to Resend</li>
          <li>Create a webhook for email.received in the Resend dashboard</li>
          <li>Use ngrok to expose your local server for testing</li>
        </ol>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Webhook Handler</h2>
        <CodeBlock
          code={webhookCode}
          title="src/app/api/webhook/route.js"
          language="javascript"
        />
      </div>
    </main>
  );
}
