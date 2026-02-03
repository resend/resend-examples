'use client';

/**
 * Resend Templates Example
 *
 * Demonstrates using Resend's hosted templates feature.
 * Templates are created in the Resend dashboard and referenced by ID.
 *
 * Key concepts:
 * - Templates are managed in the Resend dashboard
 * - Variables are passed at send time
 * - Variable names are CASE-SENSITIVE
 * - Templates must be published before use
 *
 * @see https://resend.com/docs/dashboard/templates/introduction
 */

import { CodeBlock } from '@/components/code-block';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';
import { useState } from 'react';

export default function TemplatesPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [templateId, setTemplateId] = useState('');
  const [variables, setVariables] = useState(
    '{\n  "USER_NAME": "John Doe",\n  "ORDER_TOTAL": "$99.00"\n}',
  );
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
      // Parse variables JSON
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch {
        setResult({ error: 'Invalid JSON in variables field' });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/send-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          templateId,
          variables: parsedVariables,
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

// Send email using a Resend template
const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Your Order Confirmation',
  // Use template instead of html/text/react
  template: {
    // Template ID from Resend dashboard
    id: 'tmpl_abc123',
    // Variables to populate in the template
    // IMPORTANT: Names are case-sensitive!
    variables: {
      USER_NAME: 'John Doe',    // Must match exactly
      ORDER_TOTAL: '$99.00',
    },
  },
});`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Resend Templates"
        description="Use pre-built templates from your Resend dashboard with dynamic variables."
        sourcePath="src/app/templates/page.tsx"
      />

      {/* Setup instructions */}
      <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
        <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
          <li>
            Create a template in the{' '}
            <a
              href="https://resend.com/templates"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Resend dashboard
            </a>
          </li>
          <li>
            Add variables using the format:{' '}
            <code className="bg-yellow-100 px-1 rounded">
              {'{{VARIABLE_NAME}}'}
            </code>
          </li>
          <li>Publish the template</li>
          <li>Copy the template ID and paste it below</li>
        </ol>
      </div>

      {/* Demo Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="templateId"
            className="block text-sm font-medium mb-1"
          >
            Template ID
          </label>
          <input
            id="templateId"
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] font-mono text-sm"
            placeholder="tmpl_abc123..."
          />
        </div>

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
          <label htmlFor="variables" className="block text-sm font-medium mb-1">
            Template Variables (JSON)
          </label>
          <textarea
            id="variables"
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] font-mono text-sm"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Variable names must match EXACTLY (case-sensitive)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !templateId}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Email with Template'}
        </button>
      </form>

      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
        title="Email Sent Successfully"
      />

      {/* Info box */}
      <div className="mt-6 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-medium mb-2">Template Limitations</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
          <li>• Max 20 variables per template</li>
          <li>
            • Cannot combine with{' '}
            <code className="bg-[var(--background)] px-1 rounded">html</code>,{' '}
            <code className="bg-[var(--background)] px-1 rounded">text</code>,
            or{' '}
            <code className="bg-[var(--background)] px-1 rounded">react</code>
          </li>
          <li>• Reserved names: FIRST_NAME, LAST_NAME, EMAIL, etc.</li>
          <li>• Template must be published (drafts won&apos;t work)</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Code Example</h2>
        <CodeBlock code={exampleCode} title="Sending with Templates" />
      </div>
    </main>
  );
}
