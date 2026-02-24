import { json } from "@sveltejs/kit";
import { Webhook } from "svix";
import { RESEND_WEBHOOK_SECRET } from "$env/static/private";

export async function POST({ request }) {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers);

  const wh = new Webhook(RESEND_WEBHOOK_SECRET);

  try {
    const event = wh.verify(body, headers);

    switch (event.type) {
      case "email.sent":
        console.log("Email sent:", event.data);
        break;
      case "email.delivered":
        console.log("Email delivered:", event.data);
        break;
      case "email.bounced":
        console.log("Email bounced:", event.data);
        break;
      case "email.complained":
        console.log("Email complained:", event.data);
        break;
      default:
        console.log("Unknown event:", event.type);
    }

    return json({ received: true });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return json({ error: "Invalid signature" }, { status: 400 });
  }
}
