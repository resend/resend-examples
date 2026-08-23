import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Resend } from "resend";
import { Webhook } from "svix";

const app = new Hono();

const resend = new Resend(process.env.RESEND_API_KEY);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/send", async (c) => {
  const { to, subject, message } = await c.req.json();

  if (!to || !subject || !message) {
    return c.json({ error: "Missing required fields: to, subject, message" }, 400);
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true, id: data?.id });
});

app.post("/webhook", async (c) => {
  const svixId = c.req.header("svix-id");
  const svixTimestamp = c.req.header("svix-timestamp");
  const svixSignature = c.req.header("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: "Missing webhook headers" }, 400);
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return c.json({ error: "Webhook secret not configured" }, 500);
  }

  try {
    const wh = new Webhook(webhookSecret);
    const body = await c.req.json();
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

    return c.json({ received: true, type: event.type });
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
});

app.post("/double-optin/subscribe", async (c) => {
  const { email, name = "" } = await c.req.json();

  if (!email) {
    return c.json({ error: "Missing required field: email" }, 400);
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return c.json({ error: "RESEND_AUDIENCE_ID not configured" }, 500);
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
    return c.json({ error: contactError.message }, 500);
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
    return c.json({ error: sendError.message }, 500);
  }

  return c.json({
    success: true,
    message: "Confirmation email sent",
    contact_id: contact?.id,
    email_id: sent?.id,
  });
});

app.post("/double-optin/webhook", async (c) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return c.json({ error: "Webhook secret not configured" }, 500);
  }

  try {
    const wh = new Webhook(webhookSecret);
    const body = await c.req.json();
    const payload = JSON.stringify(body);
    wh.verify(payload, {
      "svix-id": c.req.header("svix-id"),
      "svix-timestamp": c.req.header("svix-timestamp"),
      "svix-signature": c.req.header("svix-signature"),
    });

    const event = body;

    if (event.type !== "email.clicked") {
      return c.json({ received: true, type: event.type, message: "Event type ignored" });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const recipientEmail = event.data?.to?.[0];

    const { data: contacts } = await resend.contacts.list({ audienceId });
    const contact = contacts?.data.find((c) => c.email === recipientEmail);

    if (!contact) {
      return c.json({ error: "Contact not found" }, 404);
    }

    await resend.contacts.update({
      audienceId,
      id: contact.id,
      unsubscribed: false,
    });

    return c.json({
      received: true,
      type: event.type,
      confirmed: true,
      email: recipientEmail,
      contact_id: contact.id,
    });
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
});

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`Hono server running on http://localhost:${port}`);
});
