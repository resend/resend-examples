/**
 * List Contacts API Route
 *
 * GET /api/segments/contacts
 *
 * Lists all contacts in your Resend segment.
 * Requires RESEND_SEGMENT_ID environment variable.
 *
 * @see https://resend.com/docs/api-reference/contacts/list-contacts
 */


import { resend } from '../../../lib/resend';

export const GET = async () => {
  try {
    // Get segment ID from environment
    const segmentId = import.meta.env.RESEND_SEGMENT_ID;

    if (!segmentId) {
      return new Response(
        JSON.stringify({
          error: 'RESEND_SEGMENT_ID not configured',
          contacts: [],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Fetch contacts from the segment
    const { data, error } = await resend.contacts.list({
      segmentId,
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
        contacts: data?.data || [],
        total: data?.data?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch contacts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
