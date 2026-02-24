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

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/webhook')({
  POST: async ({ request }) => {
    try {
      const payload = await request.text();

      // Extract Svix headers for verification
      const svixId = request.headers.get('svix-id');
      const svixTimestamp = request.headers.get('svix-timestamp');
      const svixSignature = request.headers.get('svix-signature');

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn('Missing Svix headers - rejecting webhook');
        return new Response(
          JSON.stringify({ error: 'Missing webhook signature headers' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('RESEND_WEBHOOK_SECRET not configured');
        return new Response(
          JSON.stringify({ error: 'Webhook secret not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
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
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Handle different event types
      switch (event.type) {
        case 'email.received': {
          console.log('New email received from:', event.data.from);
          console.log('To:', event.data.to);
          console.log('Subject:', event.data.subject);

          const { data: email, error: emailError } =
            await resend.emails.receiving.get(event.data.email_id);

          if (emailError) {
            console.error('Failed to fetch email content:', emailError);
          } else {
            console.log('Email body:', email?.text || email?.html);

            if (event.data.attachments?.length > 0) {
              const { data: attachments } =
                await resend.emails.receiving.attachments.list({
                  emailId: event.data.email_id,
                });
              console.log(
                'Attachments:',
                attachments?.data?.map((a) => a.filename),
              );
            }
          }
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

        case 'email.opened':
          console.log('Email opened:', event.data.email_id);
          break;

        case 'email.clicked':
          console.log('Link clicked:', event.data.email_id);
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }

      return new Response(
        JSON.stringify({ received: true, type: event.type }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Webhook handler error:', err);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
