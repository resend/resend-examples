/**
 * API Key by ID Route
 *
 * PATCH /api/api-keys/:id - Rename an API key
 * DELETE /api/api-keys/:id - Delete an API key
 *
 * Only `name` is patchable on an existing key. `permission` and `domainId`
 * are set once at creation and never accepted here - a leaked key must
 * not be able to widen another key's scope by renaming its way into one.
 *
 * There is no GET /api/api-keys/:id - Resend does not expose a
 * retrieve-single-key endpoint, only list, create, update, and delete.
 *
 * @see https://resend.com/docs/api-reference/api-keys/update-api-key
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';
import { resend } from '~/lib/resend';

export const APIRoute = createAPIFileRoute('/api/api-keys/$id')({
  PATCH: async ({ request, params }) => {
    try {
      const { name } = await request.json();

      if (!name) {
        return new Response(
          JSON.stringify({ error: 'name is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await resend.apiKeys.update(params.id, { name });

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, apiKey: { id: params.id, name }, data }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to update API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },

  DELETE: async ({ params }) => {
    try {
      const { data, error } = await resend.apiKeys.remove(params.id);

      if (error) {
        console.error('Resend error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to delete API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
});
