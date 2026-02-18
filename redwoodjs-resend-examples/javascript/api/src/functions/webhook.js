import { Webhook } from "svix";

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

  try {
    const wh = new Webhook(webhookSecret);
    const payload = event.body || "";
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const body = JSON.parse(payload);
    console.log("Received webhook event:", body.type);

    switch (body.type) {
      case "email.received":
        console.log("New email from:", body.data?.from);
        break;
      case "email.delivered":
        console.log("Email delivered:", body.data?.email_id);
        break;
      case "email.bounced":
        console.log("Email bounced:", body.data?.email_id);
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, type: body.type }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
