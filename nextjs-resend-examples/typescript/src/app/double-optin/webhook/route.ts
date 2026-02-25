/**
 * Double Opt-In Webhook Handler
 *
 * POST /double-optin/webhook
 *
 * Handles the email.clicked event to confirm subscriptions.
 * When a user clicks the confirmation link, this webhook:
 * 1. Verifies the webhook signature
 * 2. Finds the contact by email
 * 3. Updates the contact to unsubscribed: false
 *
 * @see https://resend.com/docs/dashboard/webhooks/introduction
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const payload = await request.text();

    // Extract Svix headers for verification
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing webhook signature headers' },
        { status: 400 },
      );
    }

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
        webhookSecret,
      });
    } catch {
      console.error('Webhook verification failed');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 },
      );
    }

    // Only process email.clicked events
    if (event.type !== 'email.clicked') {
      return NextResponse.json({
        received: true,
        type: event.type,
        message: 'Event type ignored',
      });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: 'RESEND_AUDIENCE_ID not configured' },
        { status: 500 },
      );
    }

    // Get the recipient email from the webhook data
    const recipientEmail = event.data.to?.[0];
    if (!recipientEmail) {
      console.error('No recipient email in webhook data');
      return NextResponse.json(
        { error: 'No recipient email found' },
        { status: 400 },
      );
    }

    console.log(`Confirmation click received for: ${recipientEmail}`);

    // Find the contact by email
    const { data: contacts, error: listError } = await resend.contacts.list({
      audienceId,
    });

    if (listError) {
      console.error('Failed to list contacts:', listError);
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const contact = contacts?.data?.find(
      (c: { email: string }) => c.email === recipientEmail,
    );

    if (!contact) {
      console.error(`Contact not found: ${recipientEmail}`);
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Update contact to confirmed (unsubscribed: false)
    const { error: updateError } = await resend.contacts.update({
      audienceId,
      id: contact.id,
      unsubscribed: false,
    });

    if (updateError) {
      console.error('Failed to update contact:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`Contact confirmed: ${recipientEmail} (${contact.id})`);

    return NextResponse.json({
      received: true,
      type: event.type,
      confirmed: true,
      email: recipientEmail,
      contactId: contact.id,
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
