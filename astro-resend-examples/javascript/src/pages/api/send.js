/**
 * Send Email API Route
 *
 * POST /api/send
 *
 * A versatile email sending endpoint that supports:
 * - Basic HTML emails
 * - Preventing Gmail threading
 *
 * @see https://resend.com/docs/send-with-nodejs
 */

import { randomUUID } from 'node:crypto';
import { resend } from '../../lib/resend';

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { to, subject, message, preventThreading } = body;

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Missing message content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const emailOptions = {
      from: import.meta.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `<p>${message}</p>`,
    };

    // Prevent Gmail threading with unique X-Entity-Ref-ID header
    if (preventThreading) {
      emailOptions.headers = {
        'X-Entity-Ref-ID': randomUUID(),
      };
    }

    const { data, error } = await resend.emails.send(emailOptions);

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
        message: 'Email sent successfully',
        preventedThreading: preventThreading || false,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
