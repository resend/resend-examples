import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";
const templateId = process.env.RESEND_TEMPLATE_ID || "your-template-id";

// Send email using a Resend hosted template
// Template variables must match exactly (case-sensitive)
// Do not use html or text when using a template
const { data, error } = await resend.emails.send({
  from,
  to: ["delivered@resend.dev"],
  subject: "Email from Template",
});

if (error) {
  console.error("Error sending email:", error);
  process.exit(1);
}

console.log("Email sent successfully!");
console.log("Email ID:", data?.id);
console.log("Template ID:", templateId);
