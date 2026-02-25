import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({ request }) {
  const body = await request.json();
  const { to, subject, message, minutes } = body;

  if (!to || !subject || !message) {
    return json(
      { error: "Missing required fields: to, subject, message" },
      { status: 400 }
    );
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const delay = Math.min(Number(minutes) || 5, 10080);
  const scheduledAt = new Date(Date.now() + delay * 60 * 1000).toISOString();

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<h1>Hello from the future!</h1><p>${message}</p>`,
    scheduledAt,
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id, scheduledAt });
}
