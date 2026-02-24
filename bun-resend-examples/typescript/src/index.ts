import { Resend } from "resend";
import { Webhook } from "svix";

const resend = new Resend(process.env.RESEND_API_KEY);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // GET /health
    if (req.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok" });
    }

    // POST /send
    if (req.method === "POST" && url.pathname === "/send") {
      const { to, subject, message } = await req.json();

      if (!to || !subject || !message) {
        return json({ error: "Missing required fields: to, subject, message" }, 400);
      }

      const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject,
        html: `<p>${message}</p>`,
      });

      if (error) {
        return json({ error: error.message }, 500);
      }

      return json({ success: true, id: data?.id });
    }

    // POST /webhook
    if (req.method === "POST" && url.pathname === "/webhook") {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        return json({ error: "Missing webhook headers" }, 400);
      }

      const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return json({ error: "Webhook secret not configured" }, 500);
      }

      try {
        const wh = new Webhook(webhookSecret);
        const body = await req.json();
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
        return json({ error: (err as Error).message }, 400);
      }
    }

    // POST /double-optin/subscribe
    if (req.method === "POST" && url.pathname === "/double-optin/subscribe") {
      const { email, name = "" } = await req.json();

      if (!email) {
        return json({ error: "Missing required field: email" }, 400);
      }

      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (!audienceId) {
        return json({ error: "RESEND_AUDIENCE_ID not configured" }, 500);
      }

      const confirmUrl = process.env.CONFIRM_REDIRECT_URL || "https://example.com/confirmed";
      const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

      const { data: contact, error: contactError } = await resend.contacts.create({
        audienceId,
        email,
        firstName: name,
        unsubscribed: true,
      });

      if (contactError) {
        return json({ error: contactError.message }, 500);
      }

      const greeting = name ? `Welcome, ${name}!` : "Welcome!";
      const html = `<div style="text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;">
  <h1>${greeting}</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href="${confirmUrl}" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
</div>`;

      const { data: sent, error: sendError } = await resend.emails.send({
        from,
        to: [email],
        subject: "Confirm your subscription",
        html,
      });

      if (sendError) {
        return json({ error: sendError.message }, 500);
      }

      return json({
        success: true,
        message: "Confirmation email sent",
        contact_id: contact?.id,
        email_id: sent?.id,
      });
    }

    // POST /double-optin/webhook
    if (req.method === "POST" && url.pathname === "/double-optin/webhook") {
      const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return json({ error: "Webhook secret not configured" }, 500);
      }

      try {
        const wh = new Webhook(webhookSecret);
        const body = await req.json();
        const payload = JSON.stringify(body);
        wh.verify(payload, {
          "svix-id": req.headers.get("svix-id") as string,
          "svix-timestamp": req.headers.get("svix-timestamp") as string,
          "svix-signature": req.headers.get("svix-signature") as string,
        });

        const event = body;

        if (event.type !== "email.clicked") {
          return json({ received: true, type: event.type, message: "Event type ignored" });
        }

        const audienceId = process.env.RESEND_AUDIENCE_ID!;
        const recipientEmail = event.data?.to?.[0];

        const { data: contacts } = await resend.contacts.list({ audienceId });
        const contact = contacts?.data.find((c: { email: string }) => c.email === recipientEmail);

        if (!contact) {
          return json({ error: "Contact not found" }, 404);
        }

        await resend.contacts.update({
          audienceId,
          id: contact.id,
          unsubscribed: false,
        });

        return json({
          received: true,
          type: event.type,
          confirmed: true,
          email: recipientEmail,
          contact_id: contact.id,
        });
      } catch (err) {
        return json({ error: (err as Error).message }, 400);
      }
    }

    return json({ error: "Not found" }, 404);
  },
});

console.log(`Bun server running on http://localhost:${process.env.PORT || 3000}`);
