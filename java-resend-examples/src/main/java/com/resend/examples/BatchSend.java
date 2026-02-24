package com.resend.examples;

import com.resend.Resend;
import com.resend.services.batch.model.CreateBatchEmailsResponse;
import com.resend.services.batch.model.SendEmailRequest;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.List;

public class BatchSend {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");
        String contactEmail = dotenv.get("CONTACT_EMAIL", "delivered@resend.dev");

        // Batch send: up to 100 emails per call
        // Note: Batch send does not support attachments or scheduling
        SendEmailRequest email1 = SendEmailRequest.builder()
                .from(from)
                .to("delivered@resend.dev")
                .subject("We received your message")
                .html("<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>")
                .build();

        SendEmailRequest email2 = SendEmailRequest.builder()
                .from(from)
                .to(contactEmail)
                .subject("New contact form submission")
                .html("<h1>New message received</h1><p>From: delivered@resend.dev</p>")
                .build();

        try {
            CreateBatchEmailsResponse response = resend.batch().send(List.of(email1, email2));
            System.out.println("Batch sent successfully!");

            var data = response.getData();
            for (int i = 0; i < data.size(); i++) {
                System.out.println("Email " + (i + 1) + " ID: " + data.get(i).getId());
            }
        } catch (Exception e) {
            System.err.println("Error sending batch: " + e.getMessage());
            System.exit(1);
        }
    }
}
