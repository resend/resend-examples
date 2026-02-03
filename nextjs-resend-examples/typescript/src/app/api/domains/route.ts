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

import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

/**
 * Create a new domain
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Domain name is required' },
        { status: 400 },
      );
    }

    // Create the domain in Resend
    const { data, error } = await resend.domains.create({
      name,
      // Optional: specify region (us-east-1, eu-west-1, sa-east-1)
      // region: 'us-east-1',
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return the domain with its DNS records
    return NextResponse.json({
      success: true,
      domain: {
        id: data?.id,
        name: data?.name,
        status: data?.status,
        // DNS records that need to be added
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

/**
 * List all domains
 */
export async function GET() {
  try {
    const { data, error } = await resend.domains.list();

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      domains: data?.data || [],
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 },
    );
  }
}
