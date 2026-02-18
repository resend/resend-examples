'use client';

/**
 * Contacts List Component
 *
 * Displays contacts from your Resend audience.
 * Demonstrates fetching and displaying audience data.
 */

import { useEffect, useState } from 'react';

export function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch('/api/audiences/contacts');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch contacts');
        } else {
          setContacts(data.contacts || []);
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
        <p className="text-[var(--muted-foreground)] animate-pulse">
          Loading contacts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50">
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          Make sure you have created an audience and added the ID to your
          environment variables.
        </p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
        <p className="text-[var(--muted-foreground)]">
          No contacts found. Add some contacts to your audience in the{' '}
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Resend dashboard
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[var(--muted)]">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Email</th>
            <th className="text-left px-4 py-2 font-medium">Name</th>
            <th className="text-left px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2">{contact.email}</td>
              <td className="px-4 py-2 text-[var(--muted-foreground)]">
                {contact.first_name || contact.last_name
                  ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                  : '—'}
              </td>
              <td className="px-4 py-2">
                {contact.unsubscribed ? (
                  <span className="text-red-600">Unsubscribed</span>
                ) : (
                  <span className="text-green-600">Subscribed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
