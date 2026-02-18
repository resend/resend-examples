import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const body = JSON.parse(event.body || "{}");
  const { to, subject, message, minutes } = body;

  if (!to || !subject || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: to, subject, message" }),
    };
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  // Schedule for N minutes in the future (maximum: 7 days)
  const delay = Math.min(Number(minutes) || 5, 10080);
  const scheduledAt = new Date(Date.now() + delay * 60 * 1000).toISOString();

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<h1>Hello from the future!</h1><p>${message}</p>`,
    scheduledAt,
  });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: data?.id, scheduledAt }),
  };
};
