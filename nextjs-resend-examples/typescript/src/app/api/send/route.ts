/**
 * Send Email API Route
 *
 * POST /api/send
 *
 * A versatile email sending endpoint that supports:
 * - Basic HTML emails
 * - React Email templates
 * - Preventing Gmail threading
 *
 * Request body:
 * - to: string - Recipient email address
 * - subject: string - Email subject line
 * - message: string - Email body content
 * - useReactEmail?: boolean - Use React Email template
 * - name?: string - Recipient name (for React Email)
 * - preventThreading?: boolean - Prevent Gmail threading
 *
 * @see https://resend.com/docs/send-with-nodejs
 */

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { WelcomeEmail } from '@/emails/welcome';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { to, subject, message, useReactEmail, name, preventThreading } =
      body;

    // Validate required fields
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 },
      );
    }

    // Build the email options
    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: subject,
    };

    // Option 1: Use React Email template
    if (useReactEmail && name) {
      // Pass the React component directly to Resend
      // Resend will render it to HTML automatically
      emailOptions.react = WelcomeEmail({
        name,
        actionUrl: 'https://example.com/dashboard',
      });
    } else if (message) {
      // Option 2: Use plain HTML
      emailOptions.html = `<p>${message}</p>`;
    } else {
      return NextResponse.json(
        { error: 'Missing message content' },
        { status: 400 },
      );
    }

    // Option 3: Prevent Gmail threading
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
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return the email ID on success
    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Email sent successfully',
      preventedThreading: preventThreading || false,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
