import "dotenv/config";
import express, { type Request, type Response } from "express";
import { Resend } from "resend";
import { Webhook } from "svix";

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

/** Strip newlines from user-controlled values before logging */
const sanitize = (value: unknown): string =>
  String(value ?? "").replace(/[\r\n]/g, "");

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.post("/send", async (req: Request, res: Response) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    res.status(400).json({ error: "Missing required fields: to, subject, message" });
    return;
  }

  const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: `<p>${message}</p>`,
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, id: data?.id });
});

app.post("/webhook", async (req: Request, res: Response) => {
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing webhook headers" });
    return;
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  try {
    const wh = new Webhook(webhookSecret);
    const payload = JSON.stringify(req.body);
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const event = req.body;
    console.log("Received webhook event:", sanitize(event.type));

    switch (event.type) {
      case "email.received":
        console.log("New email from:", sanitize(event.data?.from));
        break;
      case "email.delivered":
        console.log("Email delivered:", sanitize(event.data?.email_id));
        break;
      case "email.bounced":
        console.log("Email bounced:", sanitize(event.data?.email_id));
        break;
    }

    res.json({ received: true, type: event.type });
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
  }
});

app.post("/double-optin/subscribe", async (req: Request, res: Response) => {
  const { email, name = "" } = req.body;

  if (!email) {
    res.status(400).json({ error: "Missing required field: email" });
    return;
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    res.status(500).json({ error: "RESEND_AUDIENCE_ID not configured" });
    return;
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
    res.status(500).json({ error: contactError.message });
    return;
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
    res.status(500).json({ error: sendError.message });
    return;
  }

  res.json({
    success: true,
    message: "Confirmation email sent",
    contact_id: contact?.id,
    email_id: sent?.id,
  });
});

app.post("/double-optin/webhook", async (req: Request, res: Response) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  try {
    const wh = new Webhook(webhookSecret);
    const payload = JSON.stringify(req.body);
    wh.verify(payload, {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    });

    const event = req.body;

    if (event.type !== "email.clicked") {
      res.json({ received: true, type: event.type, message: "Event type ignored" });
      return;
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID!;
    const recipientEmail = event.data?.to?.[0];

    const { data: contacts } = await resend.contacts.list({ audienceId });
    const contact = contacts?.data.find((c) => c.email === recipientEmail);

    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    await resend.contacts.update({
      audienceId,
      id: contact.id,
      unsubscribed: false,
    });

    res.json({
      received: true,
      type: event.type,
      confirmed: true,
      email: recipientEmail,
      contact_id: contact.id,
    });
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});
