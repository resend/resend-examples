package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.Attachment;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.List;

public class WithCidAttachments {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        // Minimal 1x1 PNG placeholder (base64-encoded)
        // In production, replace with your actual image file
        String placeholderImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        // Use Content-ID (CID) to reference inline images in HTML
        // The "cid:logo" in HTML matches the contentId "logo" in the attachment
        Attachment attachment = Attachment.builder()
                .fileName("logo.png")
                .content(placeholderImage)
                .contentId("logo")
                .build();

        String html = """
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
                  <h1>Welcome!</h1>
                  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
                  <p>The image above is embedded directly in the email, not as a downloadable attachment.</p>
                </div>
                """;

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to("delivered@resend.dev")
                .subject("Email with Inline Image - Java Example")
                .html(html)
                .attachments(List.of(attachment))
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("Email with inline image sent successfully!");
            System.out.println("Email ID: " + response.getId());
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            System.exit(1);
        }
    }
}
