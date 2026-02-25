/**
 * Double Opt-In Demo Page
 *
 * Demonstrates the double opt-in subscription flow:
 * 1. User submits email
 * 2. Contact created with unsubscribed: true
 * 3. Confirmation email sent with trackable link
 * 4. User clicks link -> webhook fires -> contact confirmed
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/double-optin')({
  component: DoubleOptinPage,
});

function DoubleOptinPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Confirm your subscription',
          message: `Hi ${name || 'there'}, please confirm your subscription by clicking the link in this email.`,
        }),
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
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: '#666' }}>&larr; Back to examples</a>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Double Opt-In</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>GDPR-compliant subscription flow with email confirmation.</p>

      <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h2 style={{ fontWeight: 600, marginBottom: 12 }}>How it works</h2>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#666', lineHeight: 2 }}>
          <li>User submits their email address</li>
          <li>Contact is created with <code>unsubscribed: true</code></li>
          <li>Confirmation email is sent with a trackable link</li>
          <li>User clicks the confirmation link</li>
          <li>Webhook receives <code>email.clicked</code> event</li>
          <li>Contact is updated to <code>unsubscribed: false</code></li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Email Address</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="delivered@resend.dev" />
        </div>

        <div>
          <label htmlFor="name" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Name (optional)</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="John Doe" />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, border: '1px solid', borderColor: result.error ? '#fca5a5' : '#86efac', background: result.error ? '#fef2f2' : '#f0fdf4' }}>
          <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
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
