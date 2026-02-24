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


import { resend } from '../../lib/resend';

/**
 * Create a new domain
 */
export const POST = async ({ request }) => {
  try {
    const { name } = await request.json();

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Domain name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
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
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Return the domain with its DNS records
    return new Response(
      JSON.stringify({
        success: true,
        domain: {
          id: data?.id,
          name: data?.name,
          status: data?.status,
          // DNS records that need to be added
          records: data?.records || [],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to create domain' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

/**
 * List all domains
 */
export const GET = async () => {
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
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch domains' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
