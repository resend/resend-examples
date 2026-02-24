/**
 * Scheduled Email Example
 *
 * Demonstrates how to schedule emails to be sent at a future time.
 *
 * @see https://resend.com/docs/send-with-schedule
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/scheduling')({
  component: SchedulingPage,
});

function SchedulingPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [subject, setSubject] = useState('Scheduled Email from Resend');
  const [message, setMessage] = useState('This email was scheduled to be sent at a specific time.');
  const [scheduledAt, setScheduledAt] = useState(() => {
    const date = new Date(Date.now() + 5 * 60 * 1000);
    return date.toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ data?: unknown; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          message,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
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
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Scheduled Sending</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Schedule emails to be sent at a specific time in the future.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="to" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>To</label>
          <input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label htmlFor="subject" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Subject</label>
          <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label htmlFor="scheduledAt" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Send At</label>
          <input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
            max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Must be within the next 7 days</p>
        </div>

        <div>
          <label htmlFor="message" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Message</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Scheduling...' : 'Schedule Email'}
        </button>
      </form>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8 }}>Scheduling Notes</h3>
        <ul style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20 }}>
          <li>Use ISO 8601 format: <code>2026-02-03T10:00:00Z</code></li>
          <li>Maximum scheduling window: 7 days</li>
          <li>Cancel with: <code>resend.emails.cancel(emailId)</code></li>
          <li>Cannot use with batch.send()</li>
        </ul>
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
