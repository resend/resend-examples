import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { to, subject, message, scheduledAt } = body;

  if (!to || !subject || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: to, subject, message",
    });
  }

  // Schedule for the provided time or default to 5 minutes from now
  // Maximum scheduling window: 7 days
  const scheduleTime =
    scheduledAt || new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject,
    html: `<h1>Hello from the future!</h1><p>${message}</p>`,
    scheduledAt: scheduleTime,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, id: data?.id, scheduledAt: scheduleTime };
});
