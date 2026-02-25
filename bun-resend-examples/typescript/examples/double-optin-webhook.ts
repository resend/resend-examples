import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const audienceId = process.env.RESEND_AUDIENCE_ID;
if (!audienceId) {
  console.error("RESEND_AUDIENCE_ID environment variable is required");
  process.exit(1);
}

/**
 * Processes the email.clicked webhook event to confirm a double opt-in subscription.
 * In production, this runs inside your web framework's webhook handler.
 */
async function processDoubleOptinWebhook(event: Record<string, any>) {
  if (event.type !== "email.clicked") {
    return { received: true, type: event.type, message: "Event type ignored" };
  }

  const recipientEmail = event.data?.to?.[0];
  if (!recipientEmail) throw new Error("No recipient email in webhook data");

  // Find the contact by email
  const { data: contacts } = await resend.contacts.list({ audienceId: audienceId! });
  const contact = contacts?.data.find((c) => c.email === recipientEmail);
  if (!contact) throw new Error(`Contact not found: ${recipientEmail}`);

  // Update contact: confirm subscription
  await resend.contacts.update({
    audienceId: audienceId!,
    id: contact.id,
    unsubscribed: false,
  });

  return {
    received: true,
    type: event.type,
    confirmed: true,
    email: recipientEmail,
    contact_id: contact.id,
  };
}

// Simulate a webhook event (in production, this comes from Resend)
const sampleEvent = {
  type: "email.clicked",
  data: { to: ["clicked@resend.dev"] },
};

console.log("Processing double opt-in webhook event...");
const result = await processDoubleOptinWebhook(sampleEvent);
console.log(JSON.stringify(result, null, 2));
