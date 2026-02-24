import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import {
  EMAIL_FROM,
  RESEND_AUDIENCE_ID,
  CONFIRM_REDIRECT_URL,
} from "$env/static/private";

export async function POST({ request }) {
  const { email } = await request.json();

  // Add unsubscribed contact to audience
  const { error: contactError } = await resend.contacts.create({
    audienceId: RESEND_AUDIENCE_ID,
    email,
    unsubscribed: true,
  });

  if (contactError) {
    return json({ error: contactError.message }, { status: 400 });
  }

  // Send confirmation email
  const confirmUrl = `${CONFIRM_REDIRECT_URL}&email=${encodeURIComponent(email)}`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: "Confirm your subscription",
    html: `
      <h1>Confirm your subscription</h1>
      <p>Click the link below to confirm your email address:</p>
      <a href="${confirmUrl}">Confirm Subscription</a>
    `,
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json(data);
}
