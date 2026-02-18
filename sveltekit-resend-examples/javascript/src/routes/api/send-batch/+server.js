/**
 * Batch Send Email API Route
 *
 * POST /api/send-batch
 *
 * Sends multiple emails in a single API call using resend.batch.send().
 * Useful for sending a confirmation to the user and a notification to your team
 * at the same time.
 *
 * Batch send limits:
 * - Maximum 100 emails per batch request
 * - Attachments are not supported in batch sends
 * - Scheduling (send_at) is not supported in batch sends
 *
 * @see https://resend.com/docs/send-with-nodejs#send-batch-emails
 */

import { json } from "@sveltejs/kit";
import { resend } from "$lib/server/resend";
import { EMAIL_FROM } from "$env/static/private";

export async function POST({ request }) {
  const { to, contactEmail } = await request.json();

  if (!to) {
    return json({ error: "Missing required field: to" }, { status: 400 });
  }

  const notifyEmail = contactEmail || to;

  const { data, error } = await resend.batch.send([
    {
      from: EMAIL_FROM,
      to: [to],
      subject: "We received your message",
      html: "<h1>Thanks!</h1><p>We'll get back to you soon.</p>",
    },
    {
      from: EMAIL_FROM,
      to: [notifyEmail],
      subject: "New contact form submission",
      html: `<h1>New message</h1><p>From: ${to}</p>`,
    },
  ]);

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json({ success: true, data });
}
