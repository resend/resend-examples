import Link from 'next/link';

/**
 * All available examples organized by category
 */
const examples = [
  {
    category: 'Sending Emails',
    items: [
      {
        title: 'Basic Send',
        description: 'Send a simple email with HTML content',
        href: '/send-email',
        type: 'page',
      },
      {
        title: 'With Attachments',
        description: 'Send emails with file attachments',
        href: '/attachments',
        type: 'page',
      },
      {
        title: 'With CID Attachments',
        description: 'Embed inline images using Content-ID',
        href: '/cid-attachments',
        type: 'page',
      },
      {
        title: 'With Templates',
        description: 'Use Resend hosted templates with variables',
        href: '/templates',
        type: 'page',
      },
      {
        title: 'With React Email',
        description: 'Build emails with React components',
        href: '/react-email',
        type: 'page',
      },
      {
        title: 'Scheduled Send',
        description: 'Schedule emails to send later',
        href: '/scheduling',
        type: 'page',
      },
    ],
  },
  {
    category: 'Forms & Actions',
    items: [
      {
        title: 'Contact Form',
        description:
          'Server Action with batch send (confirmation + notification)',
        href: '/contact-form',
        type: 'page',
      },
    ],
  },
  {
    category: 'Receiving Emails',
    items: [
      {
        title: 'Inbound Emails',
        description: 'Receive and forward emails via webhooks',
        href: '/inbound',
        type: 'page',
      },
    ],
  },
  {
    category: 'Subscription',
    items: [
      {
        title: 'Double Opt-In',
        description: 'GDPR-compliant subscription with email confirmation',
        href: '/double-optin',
        type: 'page',
      },
    ],
  },
  {
    category: 'Management',
    items: [
      {
        title: 'Audiences',
        description: 'Manage contacts and segments',
        href: '/audiences',
        type: 'page',
      },
      {
        title: 'Domains',
        description: 'Create domains and view DNS records',
        href: '/domains',
        type: 'page',
      },
    ],
  },
  {
    category: 'Advanced',
    items: [
      {
        title: 'Better Auth',
        description: 'Authentication with email verification',
        href: '/better-auth',
        type: 'page',
      },
      {
        title: 'Prevent Gmail Threading',
        description: 'Stop emails from grouping in Gmail',
        href: '/prevent-threading',
        type: 'page',
      },
    ],
  },
];

/**
 * Home Page
 *
 * Displays a navigation grid of all available examples.
 * Each example links to its dedicated page with a working demo.
 */
export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Resend Examples</h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Comprehensive examples for sending emails with{' '}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--foreground)] underline hover:no-underline"
          >
            Resend
          </a>{' '}
          and Next.js 16. Each example includes commented code to help you
          learn.
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="mb-12 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h2 className="font-semibold mb-2">Quick Setup</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--muted-foreground)]">
          <li>
            Copy{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              .env.example
            </code>{' '}
            to <code className="bg-[var(--background)] px-1 rounded">.env</code>
          </li>
          <li>
            Add your Resend API key from{' '}
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              resend.com/api-keys
            </a>
          </li>
          <li>
            Run{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              pnpm dev
            </code>{' '}
            and explore!
          </li>
        </ol>
      </div>

      {/* Examples Grid */}
      {examples.map((section) => (
        <div key={section.category} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-[var(--muted-foreground)]">
            {section.category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.type === 'api' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                      API
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        <p>
          View the source on{' '}
          <a
            href="https://github.com/resend/resend-examples"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            GitHub
          </a>{' '}
          &middot; Built with{' '}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Resend
          </a>
        </p>
      </footer>
    </main>
  );
}
