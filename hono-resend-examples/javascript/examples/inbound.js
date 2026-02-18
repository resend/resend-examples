import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// This example fetches a previously received inbound email by ID.
// The email ID comes from an "email.received" webhook event payload.
const emailId = process.env.INBOUND_EMAIL_ID || "example-email-id";

if (emailId === "example-email-id") {
  console.log("Note: Set INBOUND_EMAIL_ID to fetch a real inbound email.");
  console.log("You get this ID from the 'email.received' webhook event.\n");
}

const { data: email, error } = await resend.emails.get(emailId);

if (error) {
  console.error("Error fetching email:", error);
  process.exit(1);
}

console.log("=== Inbound Email Details ===");
console.log("From:", email?.from);
console.log("To:", email?.to);
console.log("Subject:", email?.subject);
console.log("Created:", email?.created_at);

if (email?.text) {
  const preview = email.text.length > 200 ? email.text.slice(0, 200) + "..." : email.text;
  console.log("\nText preview:\n" + preview);
}

console.log("\nDone!");
