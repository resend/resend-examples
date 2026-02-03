/**
 * Domains API Route
 *
 * POST /api/domains - Create a new domain
 * GET /api/domains - List all domains
 *
 * @see https://resend.com/docs/api-reference/domains/create-domain
 */

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Domain name is required' },
        { status: 400 },
      );
    }

    const { data, error } = await resend.domains.create({ name });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      domain: {
        id: data?.id,
        name: data?.name,
        status: data?.status,
        records: data?.records || [],
      },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to create domain' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await resend.domains.list();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ domains: data?.data || [] });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 },
    );
  }
}
