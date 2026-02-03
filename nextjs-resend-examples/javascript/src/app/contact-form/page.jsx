/**
 * Contact Form Example
 *
 * Demonstrates Server Actions with batch sending.
 */

import { PageHeader } from '@/components/page-header';
import { ContactForm } from './contact-form';

export default function ContactFormPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Contact Form"
        description="Server Action with batch send - sends confirmation to user and notification to site owner simultaneously."
        sourcePath="src/app/contact-form/page.jsx"
      />

      <ContactForm />

      <div className="mt-8 p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
        <h2 className="font-semibold mb-2">How it works</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>User fills out the contact form</li>
          <li>Form submits via Server Action (no client-side fetch needed)</li>
          <li>
            Server Action uses{' '}
            <code className="bg-[var(--background)] px-1 rounded">
              resend.batch.send()
            </code>{' '}
            to send both emails in one API call
          </li>
          <li>User receives confirmation email with their message copy</li>
          <li>Site owner receives notification with all details</li>
        </ol>
      </div>
    </main>
  );
}
