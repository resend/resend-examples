'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';

export default function DomainsPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: domain }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
      } else {
        setResult(data.domain);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Domain Management"
        description="Create domains and view required DNS records."
        sourcePath="src/app/domains/page.jsx"
      />

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium mb-1">
            Domain Name
          </label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)]"
            placeholder="notifications.example.com"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Domain'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="mb-4 p-4 rounded-lg border border-green-200 bg-green-50">
            <h3 className="font-medium text-green-800">Domain Created!</h3>
            <p className="text-sm text-green-700">ID: {result.id}</p>
            <p className="text-sm text-green-700">Status: {result.status}</p>
          </div>
          <h3 className="font-medium mb-3">Required DNS Records</h3>
          <div className="space-y-4">
            {result.records?.map((record, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              >
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--background)]">
                  {record.type}
                </span>
                <div className="mt-2 text-sm">
                  <p>
                    <span className="text-[var(--muted-foreground)]">
                      Name:
                    </span>{' '}
                    <code>{record.name}</code>
                  </p>
                  <p>
                    <span className="text-[var(--muted-foreground)]">
                      Value:
                    </span>{' '}
                    <code className="text-xs break-all">{record.value}</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
