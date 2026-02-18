package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.Attachment;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

import java.time.Instant;
import java.util.Base64;
import java.util.List;

public class WithAttachments {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        // Create sample file content
        String fileContent = "Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: " + Instant.now() + "\n";
        String encoded = Base64.getEncoder().encodeToString(fileContent.getBytes());

        // Maximum total attachment size: 40MB
        Attachment attachment = Attachment.builder()
                .fileName("sample.txt")
                .content(encoded)
                .build();

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to("delivered@resend.dev")
                .subject("Email with Attachment - Java Example")
                .html("<h1>Your attachment is ready</h1><p>Please find the file attached to this email.</p>")
                .attachments(List.of(attachment))
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("Email with attachment sent successfully!");
            System.out.println("Email ID: " + response.getId());
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            System.exit(1);
        }
    }
}
