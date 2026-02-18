import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { RESEND_AUDIENCE_ID } from "$env/static/private";

export async function POST({ request }) {
  const { email } = await request.json();

  const { data, error } = await resend.contacts.update({
    audienceId: RESEND_AUDIENCE_ID,
    id: email,
    unsubscribed: false,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
