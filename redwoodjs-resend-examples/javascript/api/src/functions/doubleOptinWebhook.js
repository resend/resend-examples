import { Webhook } from "svix";
import { resend } from "src/lib/resend";

export const handler = async (event, _context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const svixId = event.headers["svix-id"];
  const svixTimestamp = event.headers["svix-timestamp"];
  const svixSignature = event.headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing webhook headers" }),
    };
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Webhook secret not configured" }),
    };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RESEND_AUDIENCE_ID not configured" }),
    };
  }

  try {
    const wh = new Webhook(webhookSecret);
    const payload = event.body || "";
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const body = JSON.parse(payload);

    if (body.type !== "email.clicked") {
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, type: body.type, message: "Event type ignored" }),
      };
    }

    const recipientEmail = body.data?.to?.[0];
    if (!recipientEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No recipient email in webhook data" }),
      };
    }

    // Find the contact by email
    const { data: contacts } = await resend.contacts.list({ audienceId });
    const contact = contacts?.data.find((c) => c.email === recipientEmail);

    if (!contact) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Contact not found: ${recipientEmail}` }),
      };
    }

    // Update contact: confirm subscription
    await resend.contacts.update({
      audienceId,
      id: contact.id,
      unsubscribed: false,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        received: true,
        type: body.type,
        confirmed: true,
        email: recipientEmail,
        contact_id: contact.id,
      }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
