/**
 * Send Scheduled Email API Route
 *
 * POST /api/send-scheduled
 *
 * Demonstrates scheduling an email to be sent at a future time.
 * Useful for reminders, follow-ups, and time-based campaigns.
 *
 * Key constraints:
 * - Maximum 7 days in the future
 * - Use ISO 8601 datetime format
 * - Cannot use with batch.send()
 * - Can be cancelled before sending using email ID
 *
 * @see https://resend.com/docs/send-with-schedule
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/send-scheduled')({
  POST: async ({ request }) => {
    try {
      const { to, subject, message, scheduledAt } = await request.json();

      if (!to || !subject || !message || !scheduledAt) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, subject, message, scheduledAt' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Validate scheduled time is in the future
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();
      const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (scheduledDate <= now) {
        return new Response(
          JSON.stringify({ error: 'Scheduled time must be in the future' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (scheduledDate > maxDate) {
        return new Response(
          JSON.stringify({ error: 'Scheduled time cannot be more than 7 days in the future' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
        to: [to],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Scheduled Email</h1>
            <p style="color: #666; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">
              This email was scheduled to be sent at ${scheduledDate.toLocaleString()}.
            </p>
          </div>
        `,
        scheduledAt,
      });

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
          id: data?.id,
          scheduledFor: scheduledAt,
          message: 'Email scheduled successfully',
          cancelNote: `To cancel, call: resend.emails.cancel('${data?.id}')`,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to schedule email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
