/**
 * Batch Send Email API Route
 *
 * POST /api/send-batch
 *
 * Sends multiple emails in a single API call using resend.batch.send().
 * Useful for sending a confirmation to the user and a notification to your team
 * at the same time.
 *
 * Request body:
 * - to: string - Recipient email address
 * - contactEmail?: string - Internal contact/notification email address
 *
 * Batch send limits:
 * - Maximum 100 emails per batch request
 * - Attachments are not supported in batch sends
 * - Scheduling (send_at) is not supported in batch sends
 *
 * @see https://resend.com/docs/send-with-nodejs#send-batch-emails
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { to, contactEmail } = body;

  if (!to) {
    return json(
      { error: "Missing required field: to" },
      { status: 400 }
    );
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";
  const notifyEmail = contactEmail || to;

  const { data, error } = await resend.batch.send([
    {
      from,
      to: [to],
      subject: "We received your message",
      html: "<h1>Thanks!</h1><p>We'll get back to you soon.</p>",
    },
    {
      from,
      to: [notifyEmail],
      subject: "New contact form submission",
      html: `<h1>New message</h1><p>From: ${to}</p>`,
    },
  ]);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true, data });
}
