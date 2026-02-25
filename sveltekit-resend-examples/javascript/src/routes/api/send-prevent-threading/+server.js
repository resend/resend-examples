import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { EMAIL_FROM } from "$env/static/private";

export async function POST({ request }) {
  const { to, subject, html } = await request.json();
  const uniqueId = `<${crypto.randomUUID()}@resend.dev>`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
    headers: {
      "X-Entity-Ref-ID": uniqueId,
      References: uniqueId,
    },
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
