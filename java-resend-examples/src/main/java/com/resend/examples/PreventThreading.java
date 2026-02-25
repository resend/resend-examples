package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.Map;
import java.util.UUID;

public class PreventThreading {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        // Gmail groups emails into threads based on subject and Message-ID/References headers.
        // Adding a unique X-Entity-Ref-ID header per email prevents this grouping.
        try {
            for (int i = 1; i <= 3; i++) {
                CreateEmailOptions params = CreateEmailOptions.builder()
                        .from(from)
                        .to("delivered@resend.dev")
                        .subject("Order Confirmation") // Same subject for all
                        .html("<h1>Order Confirmation</h1><p>This is email #" + i + " — each appears as a separate conversation in Gmail.</p>")
                        .headers(Map.of("X-Entity-Ref-ID", UUID.randomUUID().toString()))
                        .build();

                CreateEmailResponse response = resend.emails().send(params);
                System.out.println("Email #" + i + " sent: " + response.getId());
            }

            System.out.println("\nAll emails sent with unique X-Entity-Ref-ID headers.");
            System.out.println("Each will appear as a separate conversation in Gmail.");
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            System.exit(1);
        }
    }
}
