import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { to, subject } = body;

  if (!to) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required field: to",
    });
  }

  const templateId = config.resendTemplateId;

  // Send email using a Resend hosted template
  // Template variables must match exactly (case-sensitive)
  // Do not use html or text when using a template
  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject: subject || "Email from Template",
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, id: data?.id, templateId };
});
