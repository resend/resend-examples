/**
 * Basic Send Email Example
 *
 * Demonstrates the simplest way to send an email using Resend.
 * Uses an API route to handle the actual sending.
 *
 * @see https://resend.com/docs/send-with-nodejs
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/send-email')({
  component: SendEmailPage,
});

function SendEmailPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [subject, setSubject] = useState('Hello from Resend!');
  const [message, setMessage] = useState(
    'This is a test email sent from the Resend examples app.',
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ data?: unknown; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await response.json();
      if (!response.ok) {
        setResult({ error: data.error || 'Failed to send email' });
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
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Basic Send Email</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Send a simple email with HTML content using the Resend API.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="to" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>To</label>
          <input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required style={inputStyle} placeholder="delivered@resend.dev" />
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Use delivered@resend.dev for testing</p>
        </div>

        <div>
          <label htmlFor="subject" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Subject</label>
          <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label htmlFor="message" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Message</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>

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
