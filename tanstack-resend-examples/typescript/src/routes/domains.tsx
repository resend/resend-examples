/**
 * Domains Management Example
 *
 * Demonstrates creating a domain and displaying the required
 * DNS records for verification.
 *
 * @see https://resend.com/docs/dashboard/domains/introduction
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/domains')({
  component: DomainsPage,
});

function DomainsPage() {
  const [domainName, setDomainName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ data?: unknown; error?: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: domainName }),
      });

      const data = await response.json();
      if (!response.ok) {
        setResult({ error: data.error });
      } else {
        setResult({ data });
      }
    } catch {
      setResult({ error: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: '#666' }}>&larr; Back to examples</a>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Domain Management</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Create domains and view required DNS records for verification.</p>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Create a Domain</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="domain" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Domain Name</label>
            <input
              id="domain"
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              required
              style={inputStyle}
              placeholder="notifications.example.com"
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Creating...' : 'Create Domain'}
          </button>
        </form>
      </div>

      {result && (
        <div style={{ marginBottom: 32, padding: 16, borderRadius: 8, border: '1px solid', borderColor: result.error ? '#fca5a5' : '#86efac', background: result.error ? '#fef2f2' : '#f0fdf4' }}>
          <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result.error ? { error: result.error } : result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: 32, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 12 }}>DNS Record Types</h3>
        <dl style={{ fontSize: 14, color: '#666', margin: 0 }}>
          <dt style={{ fontWeight: 600, color: '#333', marginTop: 12 }}>MX Record</dt>
          <dd style={{ margin: '4px 0 0' }}>Required for receiving emails (inbound feature)</dd>
          <dt style={{ fontWeight: 600, color: '#333', marginTop: 12 }}>SPF (TXT)</dt>
          <dd style={{ margin: '4px 0 0' }}>Authorizes Resend to send on your domain's behalf</dd>
          <dt style={{ fontWeight: 600, color: '#333', marginTop: 12 }}>DKIM (TXT)</dt>
          <dd style={{ margin: '4px 0 0' }}>Cryptographic signature to prove email authenticity</dd>
          <dt style={{ fontWeight: 600, color: '#333', marginTop: 12 }}>DMARC (TXT)</dt>
          <dd style={{ margin: '4px 0 0' }}>Policy for handling failed authentication (recommended)</dd>
        </dl>
      </div>

      <div style={{ padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 12 }}>Best Practices</h3>
        <ul style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li><strong>Use subdomains:</strong> Separate transactional (notifications.example.com) from marketing (mail.example.com)</li>
          <li><strong>Set up DMARC:</strong> Helps prevent spoofing and improves deliverability</li>
          <li><strong>Verify both SPF and DKIM:</strong> Both are important for inbox placement</li>
          <li><strong>DNS propagation:</strong> Records can take up to 48 hours to propagate</li>
        </ul>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  background: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
};
