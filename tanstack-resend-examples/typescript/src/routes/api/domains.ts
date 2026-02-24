/**
 * Domains API Route
 *
 * POST /api/domains - Create a new domain
 * GET /api/domains - List all domains
 *
 * Demonstrates domain management with Resend.
 *
 * @see https://resend.com/docs/api-reference/domains/create-domain
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/domains')({
  GET: async () => {
    try {
      const { data, error } = await resend.domains.list();

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ domains: data?.data || [] }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch domains' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const { name } = await request.json();

      if (!name) {
        return new Response(
          JSON.stringify({ error: 'Domain name is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await resend.domains.create({ name });

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
          domain: {
            id: data?.id,
            name: data?.name,
            status: data?.status,
            records: data?.records || [],
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to create domain' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
