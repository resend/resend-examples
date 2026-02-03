/**
 * Double Opt-In Subscribe Endpoint
 *
 * POST /double-optin/subscribe
 *
 * Creates a contact with unsubscribed: true and sends a confirmation email.
 * The contact remains unsubscribed until they click the confirmation link.
 *
 * Request body:
 *   - email: string (required)
 *   - name: string (optional)
 *
 * @see https://resend.com/docs/api-reference/contacts/create-contact
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: 'RESEND_AUDIENCE_ID not configured' },
        { status: 500 },
      );
    }

    const confirmUrl =
      process.env.CONFIRM_REDIRECT_URL || 'https://example.com/confirmed';

    // Step 1: Create contact with unsubscribed: true (pending confirmation)
    const { data: contact, error: contactError } = await resend.contacts.create(
      {
        audienceId,
        email,
        firstName: name || undefined,
        unsubscribed: true, // Will be set to false when they confirm
      },
    );

    if (contactError) {
      console.error('Failed to create contact:', contactError);
      return NextResponse.json(
        { error: contactError.message },
        { status: 400 },
      );
    }

    // Step 2: Send confirmation email with trackable link
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirm your subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #333; margin-bottom: 10px;">
              ${name ? `Welcome, ${name}!` : 'Welcome!'}
            </h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Please confirm your subscription to our newsletter by clicking the button below.
            </p>
            <a href="${confirmUrl}"
               style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Subscription
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request this subscription, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent. Please check your inbox.',
      contactId: contact?.id,
      emailId: emailData?.id,
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 },
    );
  }
}
