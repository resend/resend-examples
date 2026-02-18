import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { EMAIL_FROM } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const { to, subject, html, filename, content } = await request.json();

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
    attachments: [
      {
        filename,
        content: Buffer.from(content).toString("base64"),
      },
    ],
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};
