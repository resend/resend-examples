'use client';

/**
 * Scheduled Email Example
 *
 * Demonstrates how to schedule emails to be sent at a future time.
 * Useful for reminders, follow-ups, and time-sensitive communications.
 *
 * Key concepts:
 * - Use scheduled_at parameter with ISO 8601 datetime
 * - Max scheduling window is 7 days in the future
 * - Scheduled emails can be cancelled before sending
 * - Cannot use scheduling with batch.send()
 *
 * @see https://resend.com/docs/send-with-schedule
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';
import { useState } from 'react';

export default function SchedulingPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [subject, setSubject] = useState('Scheduled Email from Resend');
  const [message, setMessage] = useState(
    'This email was scheduled to be sent at a specific time.',
  );
  // Default to 5 minutes from now
  const [scheduledAt, setScheduledAt] = useState(() => {
    const date = new Date(Date.now() + 5 * 60 * 1000);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  });
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
      const response = await fetch('/api/send-scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          message,
          // Convert local datetime to ISO 8601
          scheduledAt: new Date(scheduledAt).toISOString(),
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

const resend = new Resend(process.env.RESEND_API_KEY);

// Schedule an email for the future
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Your scheduled reminder',
  html: '<p>This is your scheduled reminder!</p>',
  // ISO 8601 datetime (max 7 days in future)
  scheduledAt: '2026-02-03T10:00:00Z',
});

// The response includes the email ID
// You can use this to cancel the scheduled email:
// await resend.emails.cancel(data.id);`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Scheduled Sending"
        description="Schedule emails to be sent at a specific time in the future."
        sourcePath="src/app/scheduling/page.tsx"
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
          <label
            htmlFor="scheduledAt"
            className="block text-sm font-medium mb-1"
          >
            Send At
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
            max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 16)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Must be within the next 7 days
          </p>
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
          {loading ? 'Scheduling...' : 'Schedule Email'}
        </button>
      </form>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Scheduled Successfully"
      />

      {/* Info box */}
      <div className="mt-6 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">Scheduling Notes</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
          <li>
            • Use ISO 8601 format:{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              2026-02-03T10:00:00Z
            </code>
          </li>
          <li>• Maximum scheduling window: 7 days</li>
          <li>
            • Cancel with:{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              resend.emails.cancel(emailId)
            </code>
          </li>
          <li>• Cannot use with batch.send()</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Code Example</h2>
        <CodeBlock code={exampleCode} title="Scheduling Emails" />
      </div>
    </main>
  );
}
