import type { APIGatewayEvent, Context } from "aws-lambda";
import { resend } from "src/lib/resend";

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const body = JSON.parse(event.body || "{}");
  const { to, subject } = body;

  if (!to) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required field: to" }),
    };
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  // Minimal 1x1 PNG placeholder (base64-encoded)
  const placeholderImage =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: subject || "Email with Inline Image",
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
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: data?.id }),
  };
};
