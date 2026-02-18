import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";

// Gmail groups emails into threads based on subject and Message-ID/References headers.
// Adding a unique X-Entity-Ref-ID header per email prevents this grouping.
for (let i = 1; i <= 3; i++) {
  const { data, error } = await resend.emails.send({
    from,
    to: ["delivered@resend.dev"],
    subject: "Order Confirmation", // Same subject for all
    html: `<h1>Order Confirmation</h1><p>This is email #${i} — each appears as a separate conversation in Gmail.</p>`,
    headers: {
      "X-Entity-Ref-ID": crypto.randomUUID(),
    },
  });

  if (error) {
    console.error(`Error sending email #${i}:`, error);
    process.exit(1);
  }

  console.log(`Email #${i} sent: ${data?.id}`);
}

console.log("\nAll emails sent with unique X-Entity-Ref-ID headers.");
console.log("Each will appear as a separate conversation in Gmail.");
