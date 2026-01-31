import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Optional: Allowlist of trusted senders
const ALLOWED_SENDERS = process.env.ALLOWED_SENDERS?.split(",") || [];

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();

    // Verify webhook signature to prevent spoofed events
    const event = resend.webhooks.verify({
      payload,
      headers: {
        "svix-id": req.headers.get("svix-id"),
        "svix-timestamp": req.headers.get("svix-timestamp"),
        "svix-signature": req.headers.get("svix-signature"),
      },
      secret: process.env.RESEND_WEBHOOK_SECRET!,
    });

    if (event.type === "email.received") {
      const { email_id, from, to, subject, attachments } = event.data;

      console.log("📧 Email received:", {
        id: email_id,
        from,
        to,
        subject,
        attachmentCount: attachments?.length || 0,
      });

      // Optional: Filter by sender allowlist
      if (ALLOWED_SENDERS.length > 0) {
        const senderAllowed = ALLOWED_SENDERS.some((allowed) =>
          from.toLowerCase().includes(allowed.toLowerCase())
        );

        if (!senderAllowed) {
          console.log(`⚠️ Sender not in allowlist: ${from}`);
          // Still return 200 to acknowledge receipt
          return NextResponse.json({
            received: true,
            processed: false,
            reason: "sender_not_allowed",
          });
        }
      }

      // Fetch full email content (body + headers)
      const { data: email, error } = await resend.emails.receiving.get(
        email_id
      );

      if (error) {
        console.error("Failed to fetch email content:", error);
        return NextResponse.json(
          { error: "Failed to fetch email content" },
          { status: 500 }
        );
      }

      console.log("📄 Email content:", {
        text: email.text?.slice(0, 200) + "...", // Log first 200 chars
        hasHtml: !!email.html,
        headers: email.headers,
      });

      // Handle attachments if present
      if (attachments && attachments.length > 0) {
        const { data: attachmentList } =
          await resend.emails.receiving.attachments.list({
            emailId: email_id,
          });

        console.log(
          "📎 Attachments:",
          attachmentList?.map((att) => ({
            filename: att.filename,
            contentType: att.content_type,
            // download_url expires after 1 hour
            url: att.download_url,
          }))
        );
      }

      // Process the email here
      // Examples:
      // - Forward to another service
      // - Store in database
      // - Trigger automated response
      // - Send notification

      return NextResponse.json({
        received: true,
        processed: true,
        emailId: email_id,
      });
    }

    // Handle other event types if needed
    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    console.error("Webhook error:", error);

    // Return 400 for signature verification failures
    // This tells Resend to retry later
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
