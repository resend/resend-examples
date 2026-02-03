/**
 * Webhook Handler for Resend Events
 *
 * POST /api/webhook
 *
 * @see https://resend.com/docs/dashboard/webhooks/introduction
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request) {
  try {
    const payload = await request.text();

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
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    let event;
    try {
      event = resend.webhooks.verify({
        payload,
        headers: {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        },
        secret: webhookSecret,
      });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 },
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'email.received': {
        console.log('New email received from:', event.data.from);
        const { data: email } = await resend.emails.receiving.get(
          event.data.email_id,
        );
        console.log('Email body:', email?.text || email?.html);
        break;
      }

      case 'email.delivered':
        console.log('Email delivered:', event.data.email_id);
        break;

      case 'email.bounced':
        console.log('Email bounced:', event.data.email_id);
        break;

      case 'email.complained':
        console.log('Spam complaint:', event.data.email_id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
