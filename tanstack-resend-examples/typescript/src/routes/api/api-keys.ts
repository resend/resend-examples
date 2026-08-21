/**
 * API Keys API Route
 *
 * GET /api/api-keys - List all API keys
 * POST /api/api-keys - Create a new API key
 *
 * Demonstrates API key management with Resend.
 * Renaming and deleting a specific key live in `api-keys/$id.ts`,
 * since those operations target a single key by id.
 *
 * @see https://resend.com/docs/api-reference/api-keys/create-api-key
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/api-keys')({
  GET: async () => {
    try {
      const { data, error } = await resend.apiKeys.list();

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ apiKeys: data?.data || [] }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch API keys' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const { name, permission, domainId } = await request.json();

      if (!name || !permission) {
        return new Response(
          JSON.stringify({ error: 'name and permission are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await resend.apiKeys.create({
        name,
        permission,
        ...(domainId ? { domainId } : {}),
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
          apiKey: {
            id: data?.id,
            name,
            // The token is only ever returned once, at creation time.
            // Resend cannot show it again after this response.
            token: data?.token,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to create API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
