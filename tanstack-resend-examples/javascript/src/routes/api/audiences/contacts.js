/**
 * List Contacts API Route
 *
 * GET /api/audiences/contacts
 *
 * Lists all contacts in your Resend audience.
 * Requires RESEND_AUDIENCE_ID environment variable.
 *
 * @see https://resend.com/docs/api-reference/contacts/list-contacts
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/audiences/contacts')({
  GET: async () => {
    try {
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      if (!audienceId) {
        return new Response(
          JSON.stringify({
            error: 'RESEND_AUDIENCE_ID not configured',
            contacts: [],
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await resend.contacts.list({ audienceId });

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          contacts: data?.data || [],
          total: data?.data?.length || 0,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch contacts' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
