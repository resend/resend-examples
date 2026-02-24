import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { EMAIL_FROM } from "$env/static/private";

export async function POST({ request }) {
  const { to, subject, html, scheduledAt } = await request.json();

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
    scheduledAt,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
