package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

public class BasicSend {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to("delivered@resend.dev")
                .subject("Hello from Resend Java!")
                .html("<h1>Welcome!</h1><p>This email was sent using Resend's Java SDK.</p>")
                .text("Welcome! This email was sent using Resend's Java SDK.")
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("Email sent successfully!");
            System.out.println("Email ID: " + response.getId());
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            System.exit(1);
        }
    }
}
