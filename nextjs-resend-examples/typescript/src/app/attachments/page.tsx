'use client';

/**
 * Email with Attachments Example
 *
 * Demonstrates how to send emails with file attachments.
 * Supports both URL-based and base64-encoded attachments.
 *
 * Key concepts:
 * - Attachments can be URLs or base64 content
 * - Maximum total attachment size is 40MB
 * - Cannot use attachments with batch.send()
 *
 * @see https://resend.com/docs/send-with-attachments
 */

import { useState } from 'react';
import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';

export default function AttachmentsPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    data?: unknown;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-attachment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      });

      const data = await response.json();
      if (!response.ok) {
        setResult({ error: data.error });
      } else {
        setResult({ data });
      }
    } catch (err) {
      setResult({ error: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const exampleCode = `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Method 1: Attachment from URL
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Your invoice is attached',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      path: 'https://example.com/invoices/123.pdf',
    },
  ],
});

// Method 2: Attachment from base64 content
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Your report is attached',
  html: '<p>Please find your report attached.</p>',
  attachments: [
    {
      filename: 'report.txt',
      content: Buffer.from('Hello World').toString('base64'),
    },
  ],
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Email with Attachments"
        description="Send emails with file attachments (URL or base64 content)."
        sourcePath="src/app/attachments/page.tsx"
      />

      {/* Demo Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="to" className="block text-sm font-medium mb-1">
            To
          </label>
          <input
            id="to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Email with Attachment'}
        </button>
      </form>

      {/* Info box */}
      <div className="mt-4 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">Attachment Details</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
          <li>• File: sample.txt (generated dynamically)</li>
          <li>• Method: Base64 encoded content</li>
          <li>• Max total size: 40MB</li>
        </ul>
      </div>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Sent Successfully"
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Code Example</h2>
        <CodeBlock code={exampleCode} title="Sending with Attachments" />
      </div>
    </main>
  );
}
