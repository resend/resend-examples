import { json } from "@remix-run/node";
import { Webhook } from "svix";

export async function action({ request }) {
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  try {
    const wh = new Webhook(webhookSecret);
    const body = await request.json();
    const payload = JSON.stringify(body);
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const event = body;
    console.log("Received webhook event:", event.type);

    switch (event.type) {
      case "email.received":
        console.log("New email from:", event.data?.from);
        break;
      case "email.delivered":
        console.log("Email delivered:", event.data?.email_id);
        break;
      case "email.bounced":
        console.log("Email bounced:", event.data?.email_id);
        break;
    }

    return json({ received: true, type: event.type });
  } catch (err) {
    return json({ error: err.message }, { status: 400 });
  }
}
