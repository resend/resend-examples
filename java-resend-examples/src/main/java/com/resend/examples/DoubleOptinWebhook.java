package com.resend.examples;

import com.resend.Resend;
import com.resend.services.contacts.model.ListContactsResponseData;
import com.resend.services.contacts.model.UpdateContactOptions;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.List;
import java.util.Map;

/**
 * Processes the email.clicked webhook event to confirm a double opt-in subscription.
 * In production, this logic runs inside your web framework's webhook handler.
 */
public class DoubleOptinWebhook {

    public static Map<String, Object> processDoubleOptinWebhook(
            Resend resend, String audienceId, Map<String, Object> event) throws Exception {

        String eventType = (String) event.get("type");

        // Only process email.clicked events
        if (!"email.clicked".equals(eventType)) {
            return Map.of(
                    "received", true,
                    "type", eventType,
                    "message", "Event type ignored"
            );
        }

        // Extract recipient email from webhook payload
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        @SuppressWarnings("unchecked")
        List<String> toList = (List<String>) data.get("to");

        if (toList == null || toList.isEmpty()) {
            throw new RuntimeException("No recipient email in webhook data");
        }

        String recipientEmail = toList.get(0);

        // Find the contact by email
        var contacts = resend.contacts().list(audienceId);
        String contactId = null;

        for (ListContactsResponseData c : contacts.getData()) {
            if (recipientEmail.equals(c.getEmail())) {
                contactId = c.getId();
                break;
            }
        }

        if (contactId == null) {
            throw new RuntimeException("Contact not found: " + recipientEmail);
        }

        // Update contact: confirm subscription
        UpdateContactOptions updateParams = UpdateContactOptions.builder()
                .audienceId(audienceId)
                .id(contactId)
                .unsubscribed(false)
                .build();

        resend.contacts().update(updateParams);

        return Map.of(
                "received", true,
                "type", eventType,
                "confirmed", true,
                "email", recipientEmail,
                "contact_id", contactId
        );
    }

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        String audienceId = dotenv.get("RESEND_AUDIENCE_ID");
        if (audienceId == null || audienceId.isEmpty()) {
            System.err.println("RESEND_AUDIENCE_ID environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        // Simulate a webhook event (in production, this comes from Resend)
        Map<String, Object> sampleEvent = Map.of(
                "type", "email.clicked",
                "data", Map.of("to", List.of("clicked@resend.dev"))
        );

        try {
            System.out.println("Processing double opt-in webhook event...");
            Map<String, Object> result = processDoubleOptinWebhook(resend, audienceId, sampleEvent);
            System.out.println(result);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
