import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({ request }) {
  const body = await request.json();
  const { to, subject } = body;

  if (!to) {
    return json({ error: "Missing required field: to" }, { status: 400 });
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const placeholderImage =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: subject || "Email with Inline Image",
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
</div>`,
    attachments: [
      {
        filename: "logo.png",
        content: placeholderImage,
        contentId: "logo",
      },
    ],
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id });
}
