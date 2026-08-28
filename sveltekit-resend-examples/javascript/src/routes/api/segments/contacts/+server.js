import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { RESEND_SEGMENT_ID } from "$env/static/private";

export async function GET() {
  const { data, error } = await resend.contacts.list({
    segmentId: RESEND_SEGMENT_ID,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}

export async function POST({ request }) {
  const { email, firstName, lastName } = await request.json();

  const { data, error } = await resend.contacts.create({
    email,
    firstName,
    lastName,
    segments: [{ id: RESEND_SEGMENT_ID }],
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
