/**
 * Home Page
 *
 * Displays a navigation grid of all available examples.
 * Each example links to its dedicated page with a working demo.
 */

import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

interface ExampleItem {
  title: string;
  description: string;
  href: string;
}

const examples: { category: string; items: ExampleItem[] }[] = [
  {
    category: 'Sending Emails',
    items: [
      { title: 'Basic Send', description: 'Send a simple email with HTML content', href: '/send-email' },
      { title: 'With Attachments', description: 'Send emails with file attachments', href: '/attachments' },
      { title: 'With CID Attachments', description: 'Embed inline images using Content-ID', href: '/cid-attachments' },
      { title: 'With Templates', description: 'Use Resend hosted templates with variables', href: '/templates' },
      { title: 'Scheduled Send', description: 'Schedule emails to send later', href: '/scheduling' },
    ],
  },
  {
    category: 'Receiving Emails',
    items: [
      { title: 'Inbound Emails', description: 'Receive and forward emails via webhooks', href: '/inbound' },
    ],
  },
  {
    category: 'Subscription',
    items: [
      { title: 'Double Opt-In', description: 'GDPR-compliant subscription with email confirmation', href: '/double-optin' },
    ],
  },
  {
    category: 'Management',
    items: [
      { title: 'Audiences', description: 'Manage contacts and segments', href: '/audiences' },
      { title: 'Domains', description: 'Create domains and view DNS records', href: '/domains' },
    ],
  },
  {
    category: 'Advanced',
    items: [
      { title: 'Prevent Gmail Threading', description: 'Stop emails from grouping in Gmail', href: '/prevent-threading' },
    ],
  },
];

function HomePage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 16px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>Resend Examples</h1>
        <p style={{ fontSize: 18, color: '#666' }}>
          Comprehensive examples for sending emails with{' '}
          <a href="https://resend.com" target="_blank" rel="noopener noreferrer">Resend</a>{' '}
          and TanStack Start. Each example includes commented code to help you learn.
        </p>
      </div>

      <div style={{ marginBottom: 48, padding: 16, background: '#f5f5f5', borderRadius: 8, border: '1px solid #e5e5e5' }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Quick Setup</h2>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#666', lineHeight: 1.8 }}>
          <li>Copy <code>.env.example</code> to <code>.env</code></li>
          <li>Add your Resend API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">resend.com/api-keys</a></li>
          <li>Run <code>npm run dev</code> and explore!</li>
        </ol>
      </div>

      {examples.map((section) => (
        <div key={section.category} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#666' }}>{section.category}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'block',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #e5e5e5',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <h3 style={{ fontWeight: 500, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <footer style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid #e5e5e5', textAlign: 'center', fontSize: 14, color: '#999' }}>
        <p>
          View the source on{' '}
          <a href="https://github.com/resend/resend-examples" target="_blank" rel="noopener noreferrer">GitHub</a>
          {' \u00B7 '}
          Built with <a href="https://resend.com" target="_blank" rel="noopener noreferrer">Resend</a>
        </p>
      </footer>
    </main>
  );
}
