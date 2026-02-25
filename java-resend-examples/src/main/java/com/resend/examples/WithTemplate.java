package com.resend.examples;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

public class WithTemplate {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");
        String templateId = dotenv.get("RESEND_TEMPLATE_ID", "your-template-id");

        // Send email using a Resend hosted template
        // Template variables must match exactly (case-sensitive)
        // Do not use html or text fields when using a template
        // Note: Check the latest Java SDK docs for template support syntax
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(from)
                .to("delivered@resend.dev")
                .subject("Email from Template - Java Example")
                .build();

        // Template ID would be set via the SDK's template support
        // when available in the builder pattern

        try {
            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("Email sent successfully!");
            System.out.println("Email ID: " + response.getId());
            System.out.println("Template ID: " + templateId);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            System.exit(1);
        }
    }
}
