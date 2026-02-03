'use server';

/**
 * Contact Form Server Action
 *
 * This server action handles form submission and sends two emails
 * using Resend's batch API:
 * 1. Confirmation email to the user
 * 2. Notification email to the site owner
 *
 * Key concepts:
 * - Server Actions run on the server (secure for API keys)
 * - Batch sending reduces API calls (2 emails, 1 request)
 * - React Email components for beautiful templates
 *
 * @see https://resend.com/docs/api-reference/emails/send-batch-emails
 */

import { ContactConfirmationEmail } from '@/emails/contact-confirmation';
import { ContactNotificationEmail } from '@/emails/contact-notification';
import { resend } from '@/lib/resend';

/**
 * State shape for the contact form
 */
export interface ContactFormState {
  success: boolean;
  error: string | null;
  ids: { id: string }[] | null;
}

/**
 * Submit contact form and send batch emails
 *
 * @param prevState - Previous form state (required by useActionState)
 * @param formData - Form data from the submission
 * @returns Updated form state
 */
export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Extract form fields
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  // Validate required fields
  if (!name || !email || !message) {
    return {
      success: false,
      error: 'All fields are required',
      ids: null,
    };
  }

  // Get environment variables
  const fromEmail = process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';
  const contactEmail = process.env.CONTACT_EMAIL || 'delivered@resend.dev';

  try {
    // Use batch.send to send both emails in a single API call
    // This is more efficient than making two separate requests
    const { data, error } = await resend.batch.send([
      // Email 1: Confirmation to the user
      {
        from: fromEmail,
        to: [email],
        subject: 'We received your message - Acme',
        // Use React Email component for rich HTML emails
        react: ContactConfirmationEmail({ name, message }),
      },
      // Email 2: Notification to the site owner
      {
        from: fromEmail,
        to: [contactEmail],
        subject: `New contact form submission from ${name}`,
        react: ContactNotificationEmail({
          name,
          email,
          message,
          submittedAt: new Date().toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short',
          }),
        }),
      },
    ]);

    // Handle Resend API errors
    if (error) {
      console.error('Resend batch error:', error);
      return {
        success: false,
        error: error.message,
        ids: null,
      };
    }

    // Return success with email IDs
    return {
      success: true,
      error: null,
      ids: data?.data ?? null,
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      error: 'Failed to send emails. Please try again.',
      ids: null,
    };
  }
}
