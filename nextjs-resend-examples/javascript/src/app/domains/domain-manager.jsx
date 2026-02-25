'use client';

/**
 * Domain Manager Component
 *
 * Create domains and display required DNS records.
 */

import { useState } from 'react';

export function DomainManager() {
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
        setError(data.error || 'Failed to create domain');
      } else {
        setResult(data.domain);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Use a subdomain like notifications.example.com for best results
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Domain'}
        </button>
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* DNS Records display */}
      {result && (
        <div className="mt-6">
          <div className="mb-4 p-4 rounded-lg border border-green-200 bg-green-50">
            <h3 className="font-medium text-green-800">Domain Created!</h3>
            <p className="text-sm text-green-700 mt-1">
              ID: <code className="bg-green-100 px-1 rounded">{result.id}</code>
            </p>
            <p className="text-sm text-green-700">
              Status:{' '}
              <code className="bg-green-100 px-1 rounded">{result.status}</code>
            </p>
          </div>

          <h3 className="font-medium mb-3">Required DNS Records</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Add these records to your DNS provider to verify your domain:
          </p>

          <div className="space-y-4">
            {result.records.map((record, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--background)]">
                    {record.type}
                  </span>
                  {record.priority && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Priority: {record.priority}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[var(--muted-foreground)]">
                      Name:{' '}
                    </span>
                    <code className="bg-[var(--background)] px-1 rounded break-all">
                      {record.name}
                    </code>
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">
                      Value:{' '}
                    </span>
                    <code className="bg-[var(--background)] px-1 rounded break-all text-xs">
                      {record.value}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
