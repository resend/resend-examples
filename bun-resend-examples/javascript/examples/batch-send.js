import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";
const contactEmail = process.env.CONTACT_EMAIL || "delivered@resend.dev";

// Batch send: up to 100 emails per call
// Note: Batch send does not support attachments or scheduling
const { data, error } = await resend.batch.send([
  {
    from,
    to: ["delivered@resend.dev"],
    subject: "We received your message",
    html: "<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>",
  },
  {
    from,
    to: [contactEmail],
    subject: "New contact form submission",
    html: "<h1>New message received</h1><p>From: delivered@resend.dev</p>",
  },
]);

if (error) {
  console.error("Error sending batch:", error);
  process.exit(1);
}

console.log("Batch sent successfully!");
data?.data.forEach((email, i) => {
  console.log(`Email ${i + 1} ID: ${email.id}`);
});
