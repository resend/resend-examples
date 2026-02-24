import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

const { data, error } = await resend.emails.send({
  from,
  to: ["delivered@resend.dev"],
  subject: "Hello from Resend!",
  html: "<h1>Welcome!</h1><p>This email was sent using Resend's Node.js SDK.</p>",
  text: "Welcome! This email was sent using Resend's Node.js SDK.",
});

if (error) {
  console.error("Error sending email:", error);
  process.exit(1);
}

console.log("Email sent successfully!");
console.log("Email ID:", data?.id);
