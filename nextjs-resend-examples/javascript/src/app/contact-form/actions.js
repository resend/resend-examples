'use server';

/**
 * Contact Form Server Action
 *
 * Sends two emails using Resend's batch API:
 * 1. Confirmation email to the user
 * 2. Notification email to the site owner
 *
 * @see https://resend.com/docs/api-reference/emails/send-batch-emails
 */

import { ContactConfirmationEmail } from '@/emails/contact-confirmation';
import { ContactNotificationEmail } from '@/emails/contact-notification';
import { resend } from '@/lib/resend';

/**
 * Submit contact form and send batch emails
 *
 * @param {Object} prevState - Previous form state
 * @param {FormData} formData - Form data from submission
 * @returns {Promise<{success: boolean, error: string | null, ids: Array | null}>}
 */
export async function submitContactForm(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  if (!name || !email || !message) {
    return {
      success: false,
      error: 'All fields are required',
      ids: null,
    };
  }

  const fromEmail = process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';
  const contactEmail = process.env.CONTACT_EMAIL || 'delivered@resend.dev';

  try {
    // Use batch.send to send both emails in a single API call
    const { data, error } = await resend.batch.send([
      // Email 1: Confirmation to the user
      {
        from: fromEmail,
        to: [email],
        subject: 'We received your message - Acme',
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

    if (error) {
      console.error('Resend batch error:', error);
      return {
        success: false,
        error: error.message,
        ids: null,
      };
    }

    return {
      success: true,
      error: null,
      ids: data,
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
