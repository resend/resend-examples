import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const body = JSON.parse(event.body || "{}");
  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: to, subject, message" }),
    };
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: data?.id }),
  };
};
