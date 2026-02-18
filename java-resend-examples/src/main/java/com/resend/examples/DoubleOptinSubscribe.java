package com.resend.examples;

import com.resend.Resend;
import com.resend.services.contacts.model.CreateContactOptions;
import com.resend.services.contacts.model.CreateContactResponseData;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import io.github.cdimascio.dotenv.Dotenv;

public class DoubleOptinSubscribe {
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Usage: mvn compile exec:java -Dexec.mainClass=\"com.resend.examples.DoubleOptinSubscribe\" -Dexec.args=\"<email> [name]\"");
            System.exit(1);
        }

        String email = args[0];
        String name = args.length > 1 ? args[1] : "";

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

        String confirmUrl = dotenv.get("CONFIRM_REDIRECT_URL", "https://example.com/confirmed");
        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        Resend resend = new Resend(apiKey);

        try {
            // Step 1: Create contact with unsubscribed=true (pending confirmation)
            System.out.println("Step 1: Creating contact (pending confirmation)...");
            CreateContactOptions contactParams = CreateContactOptions.builder()
                    .audienceId(audienceId)
                    .email(email)
                    .firstName(name)
                    .unsubscribed(true)
                    .build();

            CreateContactResponseData contact = resend.contacts().create(contactParams);
            System.out.println("Contact created: " + contact.getId());

            // Step 2: Send confirmation email
            System.out.println("Step 2: Sending confirmation email...");
            String greeting = name.isEmpty() ? "Welcome!" : "Welcome, " + name + "!";

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
                      <div style="text-align: center; padding: 40px 20px;">
                        <h1 style="color: #18181b; margin-bottom: 16px;">%s</h1>
                        <p style="color: #52525b; font-size: 16px; margin-bottom: 32px;">Please confirm your subscription to our newsletter.</p>
                        <a href="%s" style="background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
                        <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
                      </div>
                    </body>
                    </html>
                    """.formatted(greeting, confirmUrl);

            CreateEmailOptions emailParams = CreateEmailOptions.builder()
                    .from(from)
                    .to(email)
                    .subject("Confirm your subscription")
                    .html(html)
                    .build();

            CreateEmailResponse sent = resend.emails().send(emailParams);

            System.out.println("\nDouble opt-in initiated!");
            System.out.println("Contact ID: " + contact.getId());
            System.out.println("Email ID: " + sent.getId());
            System.out.println("\nNext steps:");
            System.out.println("1. User clicks the confirmation link in the email");
            System.out.println("2. Resend fires an 'email.clicked' webhook event");
            System.out.println("3. Your webhook handler updates the contact to unsubscribed=false");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
