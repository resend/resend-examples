/**
 * Resend Templates Example
 *
 * Demonstrates using Resend's hosted templates feature.
 * Templates are created in the Resend dashboard and referenced by ID.
 *
 * @see https://resend.com/docs/dashboard/templates/introduction
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
});

function TemplatesPage() {
  const [to, setTo] = useState('delivered@resend.dev');
  const [templateId, setTemplateId] = useState('');
  const [variables, setVariables] = useState('{\n  "USER_NAME": "John Doe",\n  "ORDER_TOTAL": "$99.00"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
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
        body: JSON.stringify({ to, templateId, variables: parsedVariables }),
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
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Resend Templates</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Use pre-built templates from your Resend dashboard with dynamic variables.</p>

      <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8, color: '#92400e' }}>Setup Required</h3>
        <ol style={{ fontSize: 14, color: '#a16207', margin: 0, paddingLeft: 20 }}>
          <li>Create a template in the <a href="https://resend.com/templates" target="_blank" rel="noopener noreferrer">Resend dashboard</a></li>
          <li>Add variables using the format: <code>{'{{VARIABLE_NAME}}'}</code></li>
          <li>Publish the template</li>
          <li>Copy the template ID and paste it below</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="templateId" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Template ID</label>
          <input id="templateId" type="text" value={templateId} onChange={(e) => setTemplateId(e.target.value)} required style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="tmpl_abc123..." />
        </div>

        <div>
          <label htmlFor="to" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>To</label>
          <input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label htmlFor="variables" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Template Variables (JSON)</label>
          <textarea id="variables" value={variables} onChange={(e) => setVariables(e.target.value)} rows={5} style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }} />
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Variable names must match EXACTLY (case-sensitive)</p>
        </div>

        <button type="submit" disabled={loading || !templateId} style={buttonStyle}>
          {loading ? 'Sending...' : 'Send Email with Template'}
        </button>
      </form>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8 }}>Template Limitations</h3>
        <ul style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20 }}>
          <li>Max 20 variables per template</li>
          <li>Cannot combine with <code>html</code>, <code>text</code>, or <code>react</code></li>
          <li>Reserved names: FIRST_NAME, LAST_NAME, EMAIL, etc.</li>
          <li>Template must be published (drafts won't work)</li>
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
