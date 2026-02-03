'use client';

/**
 * Basic Send Email Example
 *
 * Demonstrates the simplest way to send an email using Resend.
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';
import { useState } from 'react';

export default function SendEmailPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [subject, setSubject] = useState('Hello from Resend!');
  const [message, setMessage] = useState(
    'This is a test email sent from the Resend examples app.',
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ error: data.error || 'Failed to send email' });
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

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['${to}'],
  subject: '${subject}',
  html: '<p>${message}</p>',
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Basic Send Email"
        description="Send a simple email with HTML content using the Resend API."
        sourcePath="src/app/send-email/page.jsx"
      />

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
            placeholder="delivered@resend.dev"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Use delivered@resend.dev for testing
          </p>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Sent Successfully"
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Code Example</h2>
        <CodeBlock code={exampleCode} title="API Route" language="javascript" />
      </div>
    </main>
  );
}
