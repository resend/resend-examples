import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

// Create sample file content
const fileContent = `Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: ${new Date().toISOString()}\n`;
const encoded = Buffer.from(fileContent).toString("base64");

// Maximum total attachment size: 40MB
const { data, error } = await resend.emails.send({
  from,
  to: ["delivered@resend.dev"],
  subject: "Email with Attachment",
  html: "<h1>Your attachment is ready</h1><p>Please find the file attached to this email.</p>",
  attachments: [
    {
      filename: "sample.txt",
      content: encoded,
    },
  ],
});

if (error) {
  console.error("Error sending email:", error);
  process.exit(1);
}

console.log("Email with attachment sent successfully!");
console.log("Email ID:", data?.id);
