import type { APIGatewayEvent, Context } from "aws-lambda";
import { resend } from "src/lib/resend";

export const handler = async (event: APIGatewayEvent, _context: Context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const body = JSON.parse(event.body || "{}");
  const { email, name } = body;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required field: email" }),
    };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RESEND_AUDIENCE_ID not configured" }),
    };
  }

  const confirmUrl = process.env.CONFIRM_REDIRECT_URL || "https://example.com/confirmed";
  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  // Step 1: Create contact with unsubscribed=true (pending confirmation)
  const { data: contact, error: contactError } = await resend.contacts.create({
    audienceId,
    email,
    firstName: name || "",
    unsubscribed: true,
  });

  if (contactError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: contactError.message }),
    };
  }

  // Step 2: Send confirmation email
  const greeting = name ? `Welcome, ${name}!` : "Welcome!";

  const { data: sent, error: sendError } = await resend.emails.send({
    from,
    to: [email],
    subject: "Confirm your subscription",
    html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="text-align: center; padding: 40px 20px;">
    <h1 style="color: #18181b;">${greeting}</h1>
    <p style="color: #52525b;">Please confirm your subscription to our newsletter.</p>
    <a href="${confirmUrl}" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
  </div>
</body>
</html>`,
  });

  if (sendError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: sendError.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      contactId: contact?.id,
      emailId: sent?.id,
      message: "Confirmation email sent. User must click the link to complete subscription.",
    }),
  };
};
