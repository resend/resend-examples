'use client';

/**
 * Prevent Gmail Threading Example
 *
 * Demonstrates how to prevent emails from being grouped into threads
 * in Gmail. Useful for notifications, alerts, and recurring emails
 * that should stand alone.
 *
 * Key concepts:
 * - Gmail threads by subject line and Message-ID/References headers
 * - Use unique subjects or custom headers to prevent threading
 * - X-Entity-Ref-ID header is the most reliable method
 *
 * @see https://resend.com/docs/knowledge-base/how-to-prevent-threading
 */

import { useState } from 'react';
import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';

export default function PreventThreadingPage() {
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
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: 'Your Daily Report',
          message: `This is your daily report generated at ${new Date().toLocaleString()}.`,
          preventThreading: true,
        }),
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
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Method 1: Use X-Entity-Ref-ID header (RECOMMENDED)
// This is the most reliable way to prevent threading
const { data, error } = await resend.emails.send({
  from: 'Acme <notifications@resend.dev>',
  to: ['user@example.com'],
  subject: 'Your Daily Report', // Same subject is OK!
  html: '<p>Your daily report content...</p>',
  headers: {
    // Unique value prevents Gmail from threading
    'X-Entity-Ref-ID': randomUUID(),
  },
});

// Method 2: Add timestamp to subject
// Works but clutters the subject line
const { data, error } = await resend.emails.send({
  from: 'Acme <notifications@resend.dev>',
  to: ['user@example.com'],
  subject: \`Your Daily Report - \${new Date().toLocaleDateString()}\`,
  html: '<p>Your daily report content...</p>',
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Prevent Gmail Threading"
        description="Stop emails from being grouped into conversation threads."
        sourcePath="src/app/prevent-threading/page.tsx"
      />

      {/* Explanation */}
      <div className="mb-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h2 className="font-semibold mb-2">Why Prevent Threading?</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          Gmail automatically groups emails with the same subject into threads.
          This can be problematic for:
        </p>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Daily/weekly reports that should stand alone</li>
          <li>Notification emails that need individual attention</li>
          <li>Alerts that shouldn&apos;t be buried in a thread</li>
          <li>Recurring reminders with the same subject</li>
        </ul>
      </div>

      {/* Demo Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
          {loading ? 'Sending...' : 'Send Non-Threaded Email'}
        </button>

        <p className="text-xs text-[var(--muted-foreground)]">
          Send multiple times - each email will appear separately, not in a
          thread!
        </p>
      </form>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Sent Successfully"
      />

      {/* Code Example */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Code Example</h2>
        <CodeBlock code={exampleCode} title="Preventing Threading" />
      </div>

      {/* Methods comparison */}
      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-3">Methods Compared</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2">Method</th>
              <th className="text-left py-2">Pros</th>
              <th className="text-left py-2">Cons</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted-foreground)]">
            <tr className="border-b border-[var(--border)]">
              <td className="py-2">X-Entity-Ref-ID</td>
              <td className="py-2">Clean subject, reliable</td>
              <td className="py-2">Hidden from recipients</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2">Unique subject</td>
              <td className="py-2">Simple to implement</td>
              <td className="py-2">Cluttered subject lines</td>
            </tr>
            <tr>
              <td className="py-2">References header</td>
              <td className="py-2">Standards-based</td>
              <td className="py-2">More complex</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
