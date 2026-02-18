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

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/send-template')({
  POST: async ({ request }) => {
    try {
      const { to, templateId, variables } = await request.json();

      if (!to || !templateId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, templateId' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Acme <onboarding@resend.dev>',
        to: [to],
        subject: 'Email from Template',
        template: {
          id: templateId,
          variables: variables || {},
        },
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
          message: 'Email sent with template successfully',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
