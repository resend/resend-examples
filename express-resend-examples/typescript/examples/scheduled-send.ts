import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

// Schedule for 5 minutes in the future (maximum: 7 days)
const scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

const { data, error } = await resend.emails.send({
  from,
  to: ["delivered@resend.dev"],
  subject: "Scheduled Email",
  html: "<h1>Hello from the future!</h1><p>This email was scheduled for later delivery.</p>",
  scheduledAt,
});

if (error) {
  console.error("Error scheduling email:", error);
  process.exit(1);
}

console.log("Email scheduled successfully!");
console.log("Email ID:", data?.id);
console.log("Scheduled for:", scheduledAt);
console.log(`To cancel: resend.emails.cancel("${data?.id}")`);
