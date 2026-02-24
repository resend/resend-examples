import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { RESEND_AUDIENCE_ID } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const { data, error } = await resend.contacts.list({
    audienceId: RESEND_AUDIENCE_ID,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};

export const POST: RequestHandler = async ({ request }) => {
  const { email, firstName, lastName } = await request.json();

  const { data, error } = await resend.contacts.create({
    audienceId: RESEND_AUDIENCE_ID,
    email,
    firstName,
    lastName,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};
