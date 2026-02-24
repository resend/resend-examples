/**
 * Batch Send Email Function
 *
 * POST /api/sendBatch
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

import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const body = JSON.parse(event.body || "{}");
  const { to, contactEmail } = body;

  if (!to) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required field: to" }),
    };
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
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data }),
  };
};
