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

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function GET() {
  try {
    // Get audience ID from environment
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      return NextResponse.json(
        {
          error: 'RESEND_AUDIENCE_ID not configured',
          contacts: [],
        },
        { status: 400 },
      );
    }

    // Fetch contacts from the audience
    const { data, error } = await resend.contacts.list({
      audienceId,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      contacts: data?.data || [],
      total: data?.data?.length || 0,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 },
    );
  }
}
