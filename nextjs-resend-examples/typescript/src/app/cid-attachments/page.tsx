'use client';

/**
 * CID Attachments (Inline Images) Example
 *
 * Demonstrates how to embed images directly in email HTML
 * using Content-ID (CID) references. This is useful for
 * logos, icons, and other images that should appear inline.
 *
 * Key concepts:
 * - CID attachments use a special "cid:" URL scheme
 * - Images are embedded in the email, not hosted externally
 * - Better for logos and small images that must always appear
 *
 * @see https://resend.com/docs/send-with-attachments#inline-attachments
 */

import { useState } from 'react';
import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';

export default function CidAttachmentsPage() {
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
      const response = await fetch('/api/send-cid', {
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
import { readFileSync } from 'fs';

const resend = new Resend(process.env.RESEND_API_KEY);

// Read image and convert to base64
const logoContent = readFileSync('./logo.png').toString('base64');

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['user@example.com'],
  subject: 'Email with Inline Image',
  html: \`
    <div>
      <!-- Reference the image using cid: scheme -->
      <img src="cid:logo" alt="Logo" width="200" />
      <h1>Welcome!</h1>
      <p>The logo above is embedded using CID.</p>
    </div>
  \`,
  attachments: [
    {
      filename: 'logo.png',
      content: logoContent,
      // The content_id must match the cid: reference in HTML
      content_id: 'logo',
    },
  ],
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="CID Attachments (Inline Images)"
        description="Embed images directly in your email HTML using Content-ID references."
        sourcePath="src/app/cid-attachments/page.tsx"
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
          {loading ? 'Sending...' : 'Send Email with Inline Image'}
        </button>
      </form>

      {/* Info box */}
      <div className="mt-4 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">CID vs Regular Attachments</h3>
        <div className="text-sm text-[var(--muted-foreground)] space-y-2">
          <p>
            <strong>Regular attachments:</strong> Appear at the bottom of the
            email as downloadable files.
          </p>
          <p>
            <strong>CID attachments:</strong> Embedded inline in the HTML using{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              src=&quot;cid:image-id&quot;
            </code>
          </p>
        </div>
      </div>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Sent Successfully"
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Code Example</h2>
        <CodeBlock code={exampleCode} title="Sending with CID Attachments" />
      </div>
    </main>
  );
}
