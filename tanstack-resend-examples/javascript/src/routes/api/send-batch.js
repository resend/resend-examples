/**
 * Batch Send Email API Route
 *
 * POST /api/send-batch
 *
 * Sends multiple emails in a single API call using resend.batch.send().
 * Useful for sending a confirmation to the user and a notification to your team.
 *
 * Request body:
 * - to: string - Recipient email address
 * - contactEmail?: string - Internal contact/notification email address
 *
 * @see https://resend.com/docs/send-with-nodejs#send-batch-emails
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/send-batch')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { to, contactEmail } = body;

      if (!to) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: to' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const from = process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';
      const notifyEmail = contactEmail || to;

      const { data, error } = await resend.batch.send([
        {
          from,
          to: [to],
          subject: 'We received your message',
          html: '<h1>Thanks!</h1><p>We\'ll get back to you soon.</p>',
        },
        {
          from,
          to: [notifyEmail],
          subject: 'New contact form submission',
          html: `<h1>New message</h1><p>From: ${to}</p>`,
        },
      ]);

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data,
          message: 'Batch emails sent successfully',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to send batch emails' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
