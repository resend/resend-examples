import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: to, subject, message",
    });
  }

  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject,
    html: `<p>${message}</p>`,
    text: message,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, id: data?.id };
});
