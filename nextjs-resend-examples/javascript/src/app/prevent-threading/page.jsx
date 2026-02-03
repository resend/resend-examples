'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResultDisplay } from '@/components/result-display';

export default function PreventThreadingPage() {
  const [to, setTo] = useState('delivered@resend.dev');
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
        body: JSON.stringify({
          to,
          subject: 'Your Daily Report',
          message: `Report generated at ${new Date().toLocaleString()}`,
          preventThreading: true,
        }),
      });
      const data = await response.json();
      setResult(response.ok ? { data } : { error: data.error });
    } catch (err) {
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Prevent Gmail Threading"
        description="Stop emails from being grouped into threads."
        sourcePath="src/app/prevent-threading/page.jsx"
      />
      <div className="mb-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h2 className="font-semibold mb-2">How it works</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Uses the X-Entity-Ref-ID header with a unique value to prevent Gmail
          threading.
        </p>
      </div>
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
          {loading ? 'Sending...' : 'Send Non-Threaded Email'}
        </button>
      </form>
      <ResultDisplay
        data={result?.data}
        error={result?.error}
        loading={loading}
      />
    </main>
  );
}
