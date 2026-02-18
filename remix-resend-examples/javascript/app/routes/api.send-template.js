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
  const templateId = process.env.RESEND_TEMPLATE_ID || "your-template-id";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: subject || "Email from Template",
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id, templateId });
}
