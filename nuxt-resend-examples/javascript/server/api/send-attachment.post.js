import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { to, subject, message, filename } = body;

  if (!to || !subject || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: to, subject, message",
    });
  }

  // Create sample file content as base64
  const fileContent = `Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: ${new Date().toISOString()}\n`;
  const encoded = Buffer.from(fileContent).toString("base64");

  // Maximum total attachment size: 40MB
  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject,
    html: `<h1>Your attachment is ready</h1><p>${message}</p>`,
    attachments: [
      {
        filename: filename || "sample.txt",
        content: encoded,
      },
    ],
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, id: data?.id };
});
