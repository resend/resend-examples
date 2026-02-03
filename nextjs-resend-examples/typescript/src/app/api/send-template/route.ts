/**
 * Send Email with Resend Template
 *
 * POST /api/send-template
 *
 * Demonstrates using Resend's hosted templates feature.
 * Templates are created in the dashboard and referenced by ID.
 *
 * IMPORTANT:
 * - Template variable names are CASE-SENSITIVE
 * - Templates must be published before use
 * - Cannot combine template with html/text/react
 *
 * @see https://resend.com/docs/dashboard/templates/introduction
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { to, templateId, variables } = await request.json();

    // Validate required fields
    if (!to || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, templateId' },
        { status: 400 },
      );
    }

    // Send email using the template
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      // Subject can be defined in the template or overridden here
      subject: 'Email from Template',
      // Template object replaces html/text/react
      template: {
        // The template ID from your Resend dashboard
        id: templateId,
        // Variables to populate in the template
        // These MUST match the variable names in your template exactly
        // Variable names are case-sensitive: USER_NAME ≠ user_name
        variables: variables || {},
      },
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Email sent with template successfully',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
