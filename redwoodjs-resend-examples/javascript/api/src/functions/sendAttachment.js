import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const body = JSON.parse(event.body || "{}");
  const { to, subject, message, filename, content: fileContent } = body;

  if (!to || !subject || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: to, subject, message" }),
    };
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  // Use provided file content or generate a sample
  const attachmentContent =
    fileContent ||
    Buffer.from(
      `Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: ${new Date().toISOString()}\n`
    ).toString("base64");

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<h1>Your attachment is ready</h1><p>${message}</p>`,
    attachments: [
      {
        filename: filename || "sample.txt",
        content: attachmentContent,
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
