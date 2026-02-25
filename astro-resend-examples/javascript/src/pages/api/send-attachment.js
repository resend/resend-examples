/**
 * Send Email with Attachment API Route
 *
 * POST /api/send-attachment
 *
 * Demonstrates sending an email with a file attachment.
 * This example uses base64-encoded content, but you can also
 * use URLs to files hosted elsewhere.
 *
 * Attachment options:
 * - path: URL to the file (Resend will fetch it)
 * - content: Base64-encoded file content
 *
 * Note: Attachments are NOT supported with batch.send()
 *
 * @see https://resend.com/docs/send-with-attachments
 */


import { resend } from '../../lib/resend';

export const POST = async ({ request }) => {
  try {
    const { to } = await request.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: to' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Create a sample text file content
    // In a real app, this could be:
    // - A generated PDF
    // - A file from your storage
    // - User-uploaded content
    const fileContent = `
=================================
      SAMPLE ATTACHMENT
=================================

This file was attached to your email
using Resend's attachment feature.

Sent at: ${new Date().toISOString()}

=================================
    `.trim();

    // Convert to base64 for the attachment
    const base64Content = Buffer.from(fileContent).toString('base64');

    const { data, error } = await resend.emails.send({
      from: import.meta.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
      to: [to],
      subject: 'Email with Attachment - Resend Example',
      html: `
        <h1>Your attachment is ready</h1>
        <p>Please find the sample file attached to this email.</p>
        <p>This example demonstrates how to:</p>
        <ul>
          <li>Send emails with file attachments</li>
          <li>Use base64-encoded content</li>
          <li>Set custom filenames</li>
        </ul>
        <p>Check out the <a href="https://resend.com/docs">Resend docs</a> for more examples.</p>
      `,
      // Attachments array - you can attach multiple files
      attachments: [
        {
          // The filename recipients will see
          filename: 'sample.txt',
          // Base64-encoded file content
          content: base64Content,
        },
        // You can also use URLs:
        // {
        //   filename: 'invoice.pdf',
        //   path: 'https://example.com/invoices/123.pdf',
        // },
      ],
    });

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
        message: 'Email with attachment sent successfully',
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
