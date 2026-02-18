import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

// Minimal 1x1 PNG placeholder (base64-encoded)
const placeholderImage =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// Use Content-ID (CID) to reference inline images in HTML
// The "cid:logo" in HTML matches the contentId "logo" in the attachment
const { data, error } = await resend.emails.send({
  from,
  to: ["delivered@resend.dev"],
  subject: "Email with Inline Image",
  html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
</div>`,
  attachments: [
    {
      filename: "logo.png",
      content: placeholderImage,
      contentId: "logo",
    },
  ],
});

if (error) {
  console.error("Error sending email:", error);
  process.exit(1);
}

console.log("Email with inline image sent successfully!");
console.log("Email ID:", data?.id);
