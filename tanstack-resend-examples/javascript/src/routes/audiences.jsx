/**
 * Audiences (Contacts & Segments) Example
 *
 * Demonstrates managing contacts and segments using Resend's Audiences API.
 *
 * @see https://resend.com/docs/dashboard/audiences/introduction
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/audiences')({
  component: AudiencesPage,
});

function AudiencesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/audiences/contacts')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setContacts(data.contacts || []);
        }
      })
      .catch(() => setError('Failed to fetch contacts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: '#666' }}>&larr; Back to examples</a>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>Audiences</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Manage contacts and segments for newsletters and marketing.</p>

      <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 8, color: '#92400e' }}>Setup Required</h3>
        <p style={{ fontSize: 14, color: '#a16207' }}>
          Create an audience in the{' '}
          <a href="https://resend.com/audiences" target="_blank" rel="noopener noreferrer">Resend dashboard</a>{' '}
          first. Then add the audience ID to your environment variables.
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Contacts</h2>
        {loading && <p style={{ fontSize: 14, color: '#666' }}>Loading contacts...</p>}
        {error && <p style={{ fontSize: 14, color: '#dc2626' }}>{error}</p>}
        {!loading && !error && contacts.length === 0 && (
          <p style={{ fontSize: 14, color: '#666' }}>No contacts found. Add contacts in the Resend dashboard.</p>
        )}
        {!loading && contacts.length > 0 && (
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto' }}>
            {JSON.stringify(contacts, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Contacts API</h2>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto', lineHeight: 1.6 }}>
{`// List contacts in an audience
const { data: contacts } = await resend.contacts.list({
  audienceId: 'aud_123',
});

// Create a new contact
const { data: contact } = await resend.contacts.create({
  audienceId: 'aud_123',
  email: 'delivered@resend.dev',
  firstName: 'John',
  lastName: 'Doe',
  unsubscribed: false,
});

// Update a contact
await resend.contacts.update({
  audienceId: 'aud_123',
  id: contact.id,
  firstName: 'Jane',
});

// Remove a contact
await resend.contacts.remove({
  audienceId: 'aud_123',
  id: contact.id,
});`}
        </pre>
      </div>

      <div style={{ padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 12 }}>Audiences Features</h3>
        <ul style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li><strong>Contacts:</strong> Store email addresses with optional first/last name and custom properties</li>
          <li><strong>Segments:</strong> Automatically group contacts based on rules</li>
          <li><strong>Unsubscribe handling:</strong> Track unsubscribed contacts to respect their preferences</li>
          <li><strong>Bulk operations:</strong> Import/export contacts via CSV in the dashboard</li>
        </ul>
      </div>
    </main>
  );
}
