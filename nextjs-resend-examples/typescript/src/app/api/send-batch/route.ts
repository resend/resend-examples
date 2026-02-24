/**
 * Batch Send Email API Route
 *
 * POST /api/send-batch
 *
 * Sends multiple emails in a single API call using resend.batch.send().
 * Useful for sending a confirmation to the user and a notification to your team
 * at the same time.
 *
 * Request body:
 * - to: string - Recipient email address
 * - contactEmail?: string - Internal contact/notification email address
 *
 * Batch send limits:
 * - Maximum 100 emails per batch request
 * - Attachments are not supported in batch sends
 * - Scheduling (send_at) is not supported in batch sends
 *
 * @see https://resend.com/docs/send-with-nodejs#send-batch-emails
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { to, contactEmail } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 },
      );
    }

    const from = process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>';
    const notifyEmail = contactEmail || to;

    // Send batch emails using Resend
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

    // Handle Resend API errors
    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return the batch result with email IDs
    return NextResponse.json({
      success: true,
      data,
      message: 'Batch emails sent successfully',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to send batch emails' },
      { status: 500 },
    );
  }
}
