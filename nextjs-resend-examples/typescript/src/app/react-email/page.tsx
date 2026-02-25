'use client';

/**
 * React Email Example
 *
 * Demonstrates building emails with React components using React Email.
 * This approach offers type safety, reusability, and a great DX.
 *
 * Key concepts:
 * - Email templates are React components
 * - Props provide type-safe variable passing
 * - Resend's Node.js SDK accepts React components directly
 * - Preview templates with `pnpm email:dev`
 *
 * @see https://react.email
 */

import { useState } from 'react';
import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';

export default function ReactEmailPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [name, setName] = useState('John Doe');
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
          subject: `Welcome, ${name}!`,
          // We'll use a special flag to indicate React Email template
          useReactEmail: true,
          name,
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

  const templateCode = `// src/emails/welcome.tsx
import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Button, Tailwind
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  actionUrl?: string;
}

export function WelcomeEmail({ name, actionUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to Acme!</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Heading className="text-2xl font-bold">
              Welcome, {name}!
            </Heading>
            <Text className="text-gray-700">
              Thanks for signing up. Click below to get started.
            </Text>
            <Button
              href={actionUrl}
              className="bg-black text-white px-6 py-3 rounded"
            >
              Go to Dashboard
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}`;

  const sendCode = `// API Route
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/welcome';

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Welcome to Acme!',
  // Pass the React component directly!
  react: WelcomeEmail({ name: 'John', actionUrl: '/dashboard' }),
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="React Email"
        description="Build beautiful email templates with React components."
        sourcePath="src/app/react-email/page.tsx"
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
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Recipient Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Welcome Email'}
        </button>
      </form>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Sent Successfully"
      />

      {/* Preview tip */}
      <div className="mt-6 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">Preview Templates Locally</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          Run{' '}
          <code className="bg-[var(--background)] px-1 rounded">
            pnpm email:dev
          </code>{' '}
          to preview your email templates in the browser at{' '}
          <code className="bg-[var(--background)] px-1 rounded">
            localhost:3000
          </code>
          .
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Email Template</h2>
          <CodeBlock code={templateCode} title="src/emails/welcome.tsx" />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Sending the Email</h2>
          <CodeBlock code={sendCode} title="API Route" />
        </div>
      </div>
    </main>
  );
}
