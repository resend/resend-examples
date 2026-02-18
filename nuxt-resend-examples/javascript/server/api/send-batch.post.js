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

import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { to, contactEmail } = body;

  if (!to) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required field: to",
    });
  }

  const notifyEmail = contactEmail || to;

  const { data, error } = await resend.batch.send([
    {
      from: config.emailFrom,
      to: [to],
      subject: "We received your message",
      html: "<h1>Thanks!</h1><p>We'll get back to you soon.</p>",
    },
    {
      from: config.emailFrom,
      to: [notifyEmail],
      subject: "New contact form submission",
      html: `<h1>New message</h1><p>From: ${to}</p>`,
    },
  ]);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, data };
});
