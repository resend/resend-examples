/**
 * CID Attachments (Inline Images) Example
 *
 * Demonstrates how to embed images directly in email HTML
 * using Content-ID (CID) references.
 *
 * @see https://resend.com/docs/send-with-attachments#inline-attachments
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/cid-attachments')({
  component: CidAttachmentsPage,
});

function CidAttachmentsPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-cid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
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
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>CID Attachments (Inline Images)</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Embed images directly in your email HTML using Content-ID references.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="to" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>To</label>
          <input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Sending...' : 'Send Email with Inline Image'}
        </button>
      </form>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8 }}>CID vs Regular Attachments</h3>
        <div style={{ fontSize: 14, color: '#666' }}>
          <p><strong>Regular attachments:</strong> Appear at the bottom of the email as downloadable files.</p>
          <p><strong>CID attachments:</strong> Embedded inline in the HTML using <code>src="cid:image-id"</code></p>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, border: '1px solid', borderColor: result.error ? '#fca5a5' : '#86efac', background: result.error ? '#fef2f2' : '#f0fdf4' }}>
          <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result.error ? { error: result.error } : result.data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box',
};

const buttonStyle = {
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
