import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({ request }) {
  const body = await request.json();
  const { to, subject, message, filename, content: fileContent } = body;

  if (!to || !subject || !message) {
    return json(
      { error: "Missing required fields: to, subject, message" },
      { status: 400 }
    );
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const attachmentContent =
    fileContent ||
    Buffer.from(
      `Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: ${new Date().toISOString()}\n`
    ).toString("base64");

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<h1>Your attachment is ready</h1><p>${message}</p>`,
    attachments: [
      {
        filename: filename || "sample.txt",
        content: attachmentContent,
      },
    ],
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id });
}
