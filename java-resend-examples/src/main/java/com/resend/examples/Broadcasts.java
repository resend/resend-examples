package com.resend.examples;

import com.resend.Resend;
import com.resend.services.broadcasts.model.BroadcastRecipient;
import com.resend.services.broadcasts.model.BroadcastRecipientEventType;
import com.resend.services.broadcasts.model.CreateBroadcastOptions;
import com.resend.services.broadcasts.model.CreateBroadcastResponseSuccess;
import com.resend.services.broadcasts.model.ListBroadcastRecipientsParams;
import com.resend.services.broadcasts.model.ListBroadcastRecipientsResponseSuccess;
import com.resend.services.broadcasts.model.SendBroadcastOptions;
import com.resend.services.broadcasts.model.SendBroadcastResponseSuccess;
import io.github.cdimascio.dotenv.Dotenv;

public class Broadcasts {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");
        String segmentId = dotenv.get("RESEND_SEGMENT_ID", "your-segment-id");

        try {
            // 1. Create a draft broadcast targeting a segment
            System.out.println("=== Creating Broadcast ===");
            CreateBroadcastOptions createParams = CreateBroadcastOptions.builder()
                    .name("August product update")
                    .segmentId(segmentId)
                    .from(from)
                    .subject("What's new this month")
                    .html("<p>Here's what shipped in August.</p>")
                    .build();

            CreateBroadcastResponseSuccess created = resend.broadcasts().create(createParams);
            String broadcastId = created.getId();
            System.out.println("Broadcast created: " + broadcastId);

            // 2. Send the broadcast
            System.out.println("\n=== Sending Broadcast ===");
            SendBroadcastResponseSuccess sent = resend.broadcasts().send(
                    SendBroadcastOptions.builder().build(), broadcastId);
            System.out.println("Broadcast sent: " + sent.getId());

            // 3. List the recipients the broadcast was sent to
            System.out.println("\n=== Listing Recipients (sent) ===");
            ListBroadcastRecipientsParams recipientsParams = ListBroadcastRecipientsParams.builder()
                    .type(BroadcastRecipientEventType.SENT)
                    .build();

            ListBroadcastRecipientsResponseSuccess recipients = resend.broadcasts()
                    .recipients(broadcastId, recipientsParams);
            System.out.println("Found " + recipients.getData().size() + " recipient(s)");

            for (BroadcastRecipient recipient : recipients.getData()) {
                String contactId = recipient.getContactId() != null ? recipient.getContactId() : "none";
                System.out.println("  - " + recipient.getEmail() + " (contact: " + contactId + ")");
            }
            System.out.println("Has more: " + recipients.hasMore());

            System.out.println("\nDone! Full broadcast lifecycle complete.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
