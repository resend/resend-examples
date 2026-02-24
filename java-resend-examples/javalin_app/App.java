package com.resend.javalin;

import com.resend.Resend;
import com.resend.services.contacts.model.CreateContactOptions;
import com.resend.services.contacts.model.ListContactsResponseData;
import com.resend.services.contacts.model.UpdateContactOptions;
import com.resend.services.emails.model.CreateEmailOptions;
import com.svix.Webhook;
import io.github.cdimascio.dotenv.Dotenv;
import io.javalin.Javalin;
import io.javalin.http.Context;

import java.net.http.HttpHeaders;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class App {
    private static Resend resend;
    private static Dotenv dotenv;

    public static void main(String[] args) {
        dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        resend = new Resend(apiKey);

        int port = Integer.parseInt(dotenv.get("PORT", "3000"));

        Javalin app = Javalin.create().start(port);

        app.get("/health", ctx -> ctx.json(Map.of("status", "ok")));
        app.post("/send", App::sendHandler);
        app.post("/webhook", App::webhookHandler);
        app.post("/double-optin/subscribe", App::doubleOptinSubscribeHandler);
        app.post("/double-optin/webhook", App::doubleOptinWebhookHandler);

        System.out.println("Javalin server running on http://localhost:" + port);
    }

    private static void sendHandler(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);

        String to = body.get("to");
        String subject = body.get("subject");
        String message = body.get("message");

        if (to == null || subject == null || message == null) {
            ctx.status(400).json(Map.of("error", "Missing required fields: to, subject, message"));
            return;
        }

        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        try {
            var params = CreateEmailOptions.builder()
                    .from(from)
                    .to(to)
                    .subject(subject)
                    .html("<p>" + message + "</p>")
                    .build();

            var response = resend.emails().send(params);
            ctx.json(Map.of("success", true, "id", response.getId()));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    private static void webhookHandler(Context ctx) {
        String svixId = ctx.header("svix-id");
        String svixTimestamp = ctx.header("svix-timestamp");
        String svixSignature = ctx.header("svix-signature");

        if (svixId == null || svixTimestamp == null || svixSignature == null) {
            ctx.status(400).json(Map.of("error", "Missing webhook headers"));
            return;
        }

        String webhookSecret = dotenv.get("RESEND_WEBHOOK_SECRET");
        if (webhookSecret == null) {
            ctx.status(500).json(Map.of("error", "Webhook secret not configured"));
            return;
        }

        try {
            Webhook wh = new Webhook(webhookSecret);
            HashMap<String, List<String>> headers = new HashMap<>();
            headers.put("svix-id", List.of(svixId));
            headers.put("svix-timestamp", List.of(svixTimestamp));
            headers.put("svix-signature", List.of(svixSignature));

            wh.verify(ctx.body(), headers);

            Map<String, Object> event = ctx.bodyAsClass(Map.class);
            String eventType = (String) event.get("type");

            System.out.println("Received webhook event: " + eventType);

            ctx.json(Map.of("received", true, "type", eventType));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }

    private static void doubleOptinSubscribeHandler(Context ctx) {
        Map<String, String> body = ctx.bodyAsClass(Map.class);

        String email = body.get("email");
        String name = body.getOrDefault("name", "");

        if (email == null || email.isEmpty()) {
            ctx.status(400).json(Map.of("error", "Missing required field: email"));
            return;
        }

        String audienceId = dotenv.get("RESEND_AUDIENCE_ID");
        if (audienceId == null) {
            ctx.status(500).json(Map.of("error", "RESEND_AUDIENCE_ID not configured"));
            return;
        }

        String confirmUrl = dotenv.get("CONFIRM_REDIRECT_URL", "https://example.com/confirmed");
        String from = dotenv.get("EMAIL_FROM", "Acme <onboarding@resend.dev>");

        try {
            var contactParams = CreateContactOptions.builder()
                    .audienceId(audienceId)
                    .email(email)
                    .firstName(name)
                    .unsubscribed(true)
                    .build();

            var contact = resend.contacts().create(contactParams);

            String greeting = name.isEmpty() ? "Welcome!" : "Welcome, " + name + "!";
            String html = "<div style=\"text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;\">"
                    + "<h1>" + greeting + "</h1>"
                    + "<p>Please confirm your subscription to our newsletter.</p>"
                    + "<a href=\"" + confirmUrl + "\" style=\"background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;\">Confirm Subscription</a>"
                    + "</div>";

            var emailParams = CreateEmailOptions.builder()
                    .from(from)
                    .to(email)
                    .subject("Confirm your subscription")
                    .html(html)
                    .build();

            var sent = resend.emails().send(emailParams);

            ctx.json(Map.of(
                    "success", true,
                    "message", "Confirmation email sent",
                    "contact_id", contact.getId(),
                    "email_id", sent.getId()
            ));
        } catch (Exception e) {
            ctx.status(500).json(Map.of("error", e.getMessage()));
        }
    }

    private static void doubleOptinWebhookHandler(Context ctx) {
        String webhookSecret = dotenv.get("RESEND_WEBHOOK_SECRET");
        if (webhookSecret == null) {
            ctx.status(500).json(Map.of("error", "Webhook secret not configured"));
            return;
        }

        try {
            Webhook wh = new Webhook(webhookSecret);
            HashMap<String, List<String>> headers = new HashMap<>();
            headers.put("svix-id", List.of(ctx.header("svix-id")));
            headers.put("svix-timestamp", List.of(ctx.header("svix-timestamp")));
            headers.put("svix-signature", List.of(ctx.header("svix-signature")));

            wh.verify(ctx.body(), headers);

            Map<String, Object> event = ctx.bodyAsClass(Map.class);
            String eventType = (String) event.get("type");

            if (!"email.clicked".equals(eventType)) {
                ctx.json(Map.of("received", true, "type", eventType, "message", "Event type ignored"));
                return;
            }

            String audienceId = dotenv.get("RESEND_AUDIENCE_ID");
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            List<String> toList = (List<String>) data.get("to");
            String recipientEmail = toList.get(0);

            var contacts = resend.contacts().list(audienceId);
            String contactId = null;
            for (ListContactsResponseData c : contacts.getData()) {
                if (recipientEmail.equals(c.getEmail())) {
                    contactId = c.getId();
                    break;
                }
            }

            if (contactId == null) {
                ctx.status(404).json(Map.of("error", "Contact not found"));
                return;
            }

            var updateParams = UpdateContactOptions.builder()
                    .audienceId(audienceId)
                    .id(contactId)
                    .unsubscribed(false)
                    .build();

            resend.contacts().update(updateParams);

            ctx.json(Map.of(
                    "received", true,
                    "type", eventType,
                    "confirmed", true,
                    "email", recipientEmail,
                    "contact_id", contactId
            ));
        } catch (Exception e) {
            ctx.status(400).json(Map.of("error", e.getMessage()));
        }
    }
}
