import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
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
  const templateId = process.env.RESEND_TEMPLATE_ID || "your-template-id";

  // Send email using a Resend hosted template
  // Template variables must match exactly (case-sensitive)
  // Do not use html or text when using a template
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: subject || "Email from Template",
  });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: data?.id, templateId }),
  };
};
