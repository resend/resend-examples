/**
 * Contact Form Example
 *
 * Demonstrates:
 * - Server Actions for form handling (no API route needed)
 * - Batch sending (sends 2 emails: confirmation to user + notification to owner)
 * - React Email templates
 *
 * This is the recommended approach for forms in Next.js 15.
 */

import { PageHeader } from '@/components/page-header';
import { ContactForm } from './contact-form';

export default function ContactFormPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <PageHeader
        title="Contact Form"
        description="Server Action with batch send - sends confirmation to user and notification to site owner simultaneously."
        sourcePath="src/app/contact-form/page.tsx"
      />

      {/* The form component handles its own state and submission */}
      <ContactForm />

      {/* Explanation */}
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

      {/* Code Example */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Server Action Code</h2>
        <pre className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] overflow-x-auto text-sm">
          {`"use server";

import { resend } from "@/lib/resend";
import { ContactConfirmationEmail } from "@/emails/contact-confirmation";
import { ContactNotificationEmail } from "@/emails/contact-notification";

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Batch send: both emails in one API call
  const { data, error } = await resend.batch.send([
    {
      from: process.env.EMAIL_FROM!,
      to: [email],
      subject: "We received your message",
      react: ContactConfirmationEmail({ name, message }),
    },
    {
      from: process.env.EMAIL_FROM!,
      to: [process.env.CONTACT_EMAIL!],
      subject: \`New message from \${name}\`,
      react: ContactNotificationEmail({
        name,
        email,
        message,
        submittedAt: new Date().toLocaleString(),
      }),
    },
  ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, ids: data };
}`}
        </pre>
      </div>
    </main>
  );
}
