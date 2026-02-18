import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    return json(
      { error: "Missing required fields: to, subject, message" },
      { status: 400 }
    );
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, id: data?.id });
}
