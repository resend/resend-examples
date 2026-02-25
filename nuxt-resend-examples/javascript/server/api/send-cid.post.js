import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const resend = new Resend(config.resendApiKey);
  const body = await readBody(event);

  const { to, subject } = body;

  if (!to || !subject) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: to, subject",
    });
  }

  // Minimal 1x1 PNG placeholder (base64-encoded)
  const placeholderImage =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  // Use Content-ID (CID) to reference inline images in HTML
  // The "cid:logo" in HTML matches the contentId "logo" in the attachment
  const { data, error } = await resend.emails.send({
    from: config.emailFrom,
    to: [to],
    subject,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
</div>`,
    attachments: [
      {
        filename: "logo.png",
        content: placeholderImage,
        contentId: "logo",
      },
    ],
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, id: data?.id };
});
