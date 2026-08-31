/**
 * List Contacts API Route
 *
 * GET /api/segments/contacts
 *
 * @see https://resend.com/docs/api-reference/contacts/list-contacts
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function GET() {
  try {
    const segmentId = process.env.RESEND_SEGMENT_ID;

    if (!segmentId) {
      return NextResponse.json(
        { error: 'RESEND_SEGMENT_ID not configured', contacts: [] },
        { status: 400 },
      );
    }

    const { data, error } = await resend.contacts.list({ segmentId });

    if (error) {
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
