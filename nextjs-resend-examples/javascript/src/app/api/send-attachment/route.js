/**
 * Send Email with Attachment API Route
 *
 * POST /api/send-attachment
 *
 * @see https://resend.com/docs/send-with-attachments
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 },
      );
    }

    const fileContent = `
=================================
      SAMPLE ATTACHMENT
=================================

This file was attached to your email
using Resend's attachment feature.

Sent at: ${new Date().toISOString()}

=================================
    `.trim();

    const base64Content = Buffer.from(fileContent).toString('base64');

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: 'Email with Attachment - Resend Example',
      html: `
        <h1>Your attachment is ready</h1>
        <p>Please find the sample file attached to this email.</p>
      `,
      attachments: [
        {
          filename: 'sample.txt',
          content: base64Content,
        },
      ],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Email with attachment sent successfully',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
