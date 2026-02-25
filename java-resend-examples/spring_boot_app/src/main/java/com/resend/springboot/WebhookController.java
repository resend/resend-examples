package com.resend.springboot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.svix.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class WebhookController {

    @Value("${RESEND_WEBHOOK_SECRET:}")
    private String webhookSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "svix-id", required = false) String svixId,
            @RequestHeader(value = "svix-timestamp", required = false) String svixTimestamp,
            @RequestHeader(value = "svix-signature", required = false) String svixSignature) {

        if (svixId == null || svixTimestamp == null || svixSignature == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing webhook headers"));
        }

        if (webhookSecret == null || webhookSecret.isEmpty()) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Webhook secret not configured"));
        }

        try {
            Webhook wh = new Webhook(webhookSecret);
            HashMap<String, List<String>> headers = new HashMap<>();
            headers.put("svix-id", List.of(svixId));
            headers.put("svix-timestamp", List.of(svixTimestamp));
            headers.put("svix-signature", List.of(svixSignature));

            wh.verify(payload, headers);

            Map<String, Object> event = objectMapper.readValue(payload, Map.class);
            String eventType = (String) event.get("type");

            System.out.println("Received webhook event: " + eventType);

            switch (eventType) {
                case "email.received" -> {
                    Map<String, Object> data = (Map<String, Object>) event.get("data");
                    System.out.println("New email from: " + data.get("from"));
                }
                case "email.delivered" -> {
                    Map<String, Object> data = (Map<String, Object>) event.get("data");
                    System.out.println("Email delivered: " + data.get("email_id"));
                }
                case "email.bounced" -> {
                    Map<String, Object> data = (Map<String, Object>) event.get("data");
                    System.out.println("Email bounced: " + data.get("email_id"));
                }
            }

            return ResponseEntity.ok(Map.of("received", true, "type", eventType));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
