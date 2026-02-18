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

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request) {
  try {
    const { to, subject, message, scheduledAt } = await request.json();

    // Validate required fields
    if (!to || !subject || !message || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message, scheduledAt' },
        { status: 400 },
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 },
      );
    }

    if (scheduledDate > maxDate) {
      return NextResponse.json(
        { error: 'Scheduled time cannot be more than 7 days in the future' },
        { status: 400 },
      );
    }

    // Send the scheduled email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: subject,
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
      // The key parameter for scheduling!
      // Must be ISO 8601 format
      scheduledAt: scheduledAt,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      scheduledFor: scheduledAt,
      message: 'Email scheduled successfully',
      // You can use this ID to cancel the email later:
      // await resend.emails.cancel(data.id)
      cancelNote: `To cancel, call: resend.emails.cancel('${data?.id}')`,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to schedule email' },
      { status: 500 },
    );
  }
}
