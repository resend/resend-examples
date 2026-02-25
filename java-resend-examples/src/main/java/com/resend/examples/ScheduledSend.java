package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class ScheduledSend {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        // Schedule for 5 minutes in the future (maximum: 7 days)
        Instant scheduledAt = Instant.now().plus(5, ChronoUnit.MINUTES);
        String scheduledAtIso = DateTimeFormatter.ISO_INSTANT.format(scheduledAt);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to("delivered@resend.dev")
                .subject("Scheduled Email from Java")
                .html("<h1>Hello from the future!</h1><p>This email was scheduled for later delivery.</p>")
                .text("Hello from the future! This email was scheduled for later delivery.")
                .scheduledAt(scheduledAtIso)
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            String readableTime = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    .withZone(ZoneOffset.UTC)
                    .format(scheduledAt);

            System.out.println("Email scheduled successfully!");
            System.out.println("Email ID: " + response.getId());
            System.out.println("Scheduled for: " + readableTime + " UTC");
            System.out.println("To cancel: resend.emails().cancel(\"" + response.getId() + "\")");
        } catch (Exception e) {
            System.err.println("Error scheduling email: " + e.getMessage());
            System.exit(1);
        }
    }
}
