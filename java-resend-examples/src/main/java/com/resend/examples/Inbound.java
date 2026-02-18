package com.resend.examples;

import com.resend.Resend;
import io.github.cdimascio.dotenv.Dotenv;

public class Inbound {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        // This example fetches a previously received inbound email by ID.
        // The email ID comes from an "email.received" webhook event payload.
        // Set up inbound webhooks at: https://resend.com/webhooks
        String emailId = dotenv.get("INBOUND_EMAIL_ID", "example-email-id");

        if (emailId.equals("example-email-id")) {
            System.out.println("Note: Set INBOUND_EMAIL_ID to fetch a real inbound email.");
            System.out.println("You get this ID from the 'email.received' webhook event.\n");
        }

        try {
            var email = resend.emails().get(emailId);

            System.out.println("=== Inbound Email Details ===");
            System.out.println("From: " + email.getFrom());
            System.out.println("To: " + email.getTo());
            System.out.println("Subject: " + email.getSubject());
            System.out.println("Created: " + email.getCreatedAt());

            String text = email.getText();
            if (text != null && !text.isEmpty()) {
                String preview = text.length() > 200 ? text.substring(0, 200) + "..." : text;
                System.out.println("\nText preview:\n" + preview);
            }

            System.out.println("\nDone!");
        } catch (Exception e) {
            System.err.println("Error fetching email: " + e.getMessage());
            System.exit(1);
        }
    }
}
