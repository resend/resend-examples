/**
 * Prevent Gmail Threading Example
 *
 * Demonstrates how to prevent emails from being grouped into threads in Gmail.
 *
 * @see https://resend.com/docs/knowledge-base/how-to-prevent-threading
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/prevent-threading')({
  component: PreventThreadingPage,
});

function PreventThreadingPage() {
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
          message: `This is your daily report generated at ${new Date().toLocaleString()}.`,
          preventThreading: true,
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
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Prevent Gmail Threading</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Stop emails from being grouped into conversation threads.</p>

      <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Why Prevent Threading?</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Gmail automatically groups emails with the same subject into threads. This can be problematic for:
        </p>
        <ul style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20 }}>
          <li>Daily/weekly reports that should stand alone</li>
          <li>Notification emails that need individual attention</li>
          <li>Alerts that shouldn't be buried in a thread</li>
          <li>Recurring reminders with the same subject</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        <div>
          <label htmlFor="to" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>To</label>
          <input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Sending...' : 'Send Non-Threaded Email'}
        </button>

        <p style={{ fontSize: 12, color: '#999' }}>
          Send multiple times - each email will appear separately, not in a thread!
        </p>
      </form>

      {result && (
        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, border: '1px solid', borderColor: result.error ? '#fca5a5' : '#86efac', background: result.error ? '#fef2f2' : '#f0fdf4' }}>
          <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result.error ? { error: result.error } : result.data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 32, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 12 }}>Methods Compared</h3>
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Method</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Pros</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Cons</th>
            </tr>
          </thead>
          <tbody style={{ color: '#666' }}>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: 8 }}>X-Entity-Ref-ID</td>
              <td style={{ padding: 8 }}>Clean subject, reliable</td>
              <td style={{ padding: 8 }}>Hidden from recipients</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: 8 }}>Unique subject</td>
              <td style={{ padding: 8 }}>Simple to implement</td>
              <td style={{ padding: 8 }}>Cluttered subject lines</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>References header</td>
              <td style={{ padding: 8 }}>Standards-based</td>
              <td style={{ padding: 8 }}>More complex</td>
            </tr>
          </tbody>
        </table>
      </div>
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
