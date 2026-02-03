/**
 * Webhook Handler for Resend Events
 *
 * POST /api/webhook
 *
 * Handles incoming webhook events from Resend including:
 * - email.received: New inbound email arrived
 * - email.delivered: Email was delivered successfully
 * - email.bounced: Email bounced
 * - email.complained: Recipient marked as spam
 *
 * IMPORTANT: Always verify webhook signatures to prevent spoofed events!
 *
 * @see https://resend.com/docs/dashboard/webhooks/introduction
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    // Get the raw payload for signature verification
    const payload = await request.text();

    // Extract Svix headers for verification
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    // Verify webhook signature (CRITICAL for security!)
    // Without this, attackers could send fake events to your endpoint
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.warn('Missing Svix headers - rejecting webhook');
      return NextResponse.json(
        { error: 'Missing webhook signature headers' },
        { status: 400 },
      );
    }

    // Get the webhook secret from environment
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = resend.webhooks.verify({
        payload,
        headers: {
          id: svixId,
          timestamp: svixTimestamp,
          signature: svixSignature,
        },
        webhookSecret: webhookSecret,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 },
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'email.received': {
        // New inbound email arrived!
        // The webhook only contains metadata - fetch the full content
        console.log('New email received from:', event.data.from);
        console.log('To:', event.data.to);
        console.log('Subject:', event.data.subject);

        // Fetch the full email content (body, headers)
        const { data: email, error: emailError } =
          await resend.emails.receiving.get(event.data.email_id);

        if (emailError) {
          console.error('Failed to fetch email content:', emailError);
        } else {
          console.log('Email body:', email?.text || email?.html);

          // Check for attachments
          if (event.data.attachments?.length > 0) {
            const { data: attachments } =
              await resend.emails.receiving.attachments.list({
                emailId: event.data.email_id,
              });
            console.log(
              'Attachments:',
              attachments?.data?.map((a: { filename?: string }) => a.filename),
            );
          }

          // Example: Forward the email to your team
          // await resend.emails.send({
          //   from: 'System <system@yourdomain.com>',
          //   to: ['team@yourdomain.com'],
          //   subject: `Fwd: ${event.data.subject}`,
          //   html: email?.html || `<pre>${email?.text}</pre>`,
          // });
        }
        break;
      }

      case 'email.delivered':
        // Email was successfully delivered
        console.log('Email delivered:', event.data.email_id);
        // Update your database, trigger notifications, etc.
        break;

      case 'email.bounced':
        // Email bounced - recipient address is invalid
        console.log('Email bounced:', event.data.email_id);
        // Remove from mailing list, alert user, etc.
        break;

      case 'email.complained':
        // Recipient marked email as spam
        console.log('Spam complaint:', event.data.email_id);
        // Unsubscribe user immediately!
        break;

      case 'email.opened':
        // Email was opened (if tracking is enabled)
        console.log('Email opened:', event.data.email_id);
        break;

      case 'email.clicked':
        // Link in email was clicked (if tracking is enabled)
        console.log('Link clicked:', event.data.email_id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    // Always return 200 to acknowledge receipt
    // Non-200 responses will cause Resend to retry
    return NextResponse.json({
      received: true,
      type: event.type,
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
