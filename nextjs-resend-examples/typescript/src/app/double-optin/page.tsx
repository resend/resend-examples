'use client';

/**
 * Double Opt-In Demo Page
 *
 * Demonstrates the double opt-in subscription flow:
 * 1. User submits email
 * 2. Contact created with unsubscribed: true
 * 3. Confirmation email sent with trackable link
 * 4. User clicks link → webhook fires → contact confirmed
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';
import { useState } from 'react';

export default function DoubleOptinPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/double-optin/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to subscribe' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <PageHeader
        title="Double Opt-In"
        description="GDPR-compliant subscription flow with email confirmation"
      />

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">How it works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>User submits their email address</li>
          <li>
            Contact is created with <code>unsubscribed: true</code>
          </li>
          <li>Confirmation email is sent with a trackable link</li>
          <li>User clicks the confirmation link</li>
          <li>
            Webhook receives <code>email.clicked</code> event
          </li>
          <li>
            Contact is updated to <code>unsubscribed: false</code>
          </li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="delivered@resend.dev"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="John Doe"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {result && <ResultDisplay data={result} />}

      <CodeBlock
        title="double-optin/subscribe/route.ts"
        language="typescript"
        code={`// 1. Create contact (pending confirmation)
const contact = await resend.contacts.create({
  audienceId: AUDIENCE_ID,
  email,
  firstName: name,
  unsubscribed: true, // Not confirmed yet
});

// 2. Send confirmation email
await resend.emails.send({
  to: [email],
  subject: "Confirm your subscription",
  html: \`<a href="\${CONFIRM_URL}">Confirm</a>\`,
});`}
      />
    </div>
  );
}
