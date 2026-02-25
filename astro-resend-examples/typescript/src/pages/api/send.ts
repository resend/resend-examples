/**
 * Send Email API Route
 *
 * POST /api/send
 *
 * A versatile email sending endpoint that supports:
 * - Basic HTML emails
 * - Preventing Gmail threading
 *
 * Request body:
 * - to: string - Recipient email address
 * - subject: string - Email subject line
 * - message: string - Email body content
 * - preventThreading?: boolean - Prevent Gmail threading
 *
 * @see https://resend.com/docs/send-with-nodejs
 */

import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { resend } from '../../lib/resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body
    const body = await request.json();
    const { to, subject, message, preventThreading } = body;

    // Validate required fields
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

    // Build the email options
    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from: import.meta.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `<p>${message}</p>`,
    };

    // Prevent Gmail threading
    // Gmail threads emails by subject and Message-ID/References
    // Using X-Entity-Ref-ID with a unique value prevents threading
    if (preventThreading) {
      emailOptions.headers = {
        'X-Entity-Ref-ID': randomUUID(),
      };
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send(emailOptions);

    // Handle Resend API errors
    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Return the email ID on success
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
