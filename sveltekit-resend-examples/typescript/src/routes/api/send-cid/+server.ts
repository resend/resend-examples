import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { EMAIL_FROM } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const { to, subject } = await request.json();

  // 1x1 transparent PNG as a placeholder for the CID image example
  const placeholderPng =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html: '<p>Here is an embedded image:</p><img src="cid:logo" width="200" />',
    attachments: [
      {
        filename: "logo.png",
        content: Buffer.from(placeholderPng, "base64"),
        content_id: "logo",
      },
    ],
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
};
