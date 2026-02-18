import "dotenv/config";
import { Resend } from "resend";

const email = process.argv[2];
const name = process.argv[3] || "";

if (!email) {
  console.log("Usage: node examples/double-optin-subscribe.js <email> [name]");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const audienceId = process.env.RESEND_AUDIENCE_ID;
if (!audienceId) {
  console.error("RESEND_AUDIENCE_ID environment variable is required");
  process.exit(1);
}

const confirmUrl = process.env.CONFIRM_REDIRECT_URL || "https://example.com/confirmed";
const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

// Step 1: Create contact with unsubscribed=true (pending confirmation)
console.log("Step 1: Creating contact (pending confirmation)...");
const { data: contact, error: contactError } = await resend.contacts.create({
  audienceId,
  email,
  firstName: name,
  unsubscribed: true,
});

if (contactError) {
  console.error("Error creating contact:", contactError);
  process.exit(1);
}
console.log("Contact created:", contact?.id);

// Step 2: Send confirmation email
console.log("Step 2: Sending confirmation email...");
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
  console.error("Error sending confirmation:", sendError);
  process.exit(1);
}

console.log("\nDouble opt-in initiated!");
console.log("Contact ID:", contact?.id);
console.log("Email ID:", sent?.id);
console.log("\nNext steps:");
console.log("1. User clicks the confirmation link in the email");
console.log("2. Resend fires an 'email.clicked' webhook event");
console.log("3. Your webhook handler updates the contact to unsubscribed=false");
