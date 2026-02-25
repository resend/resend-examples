package com.resend.springboot;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class EmailController {

    @Autowired
    private Resend resend;

    @Value("${EMAIL_FROM:Acme <onboarding@resend.dev>}")
    private String from;

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> body) {
        String to = body.get("to");
        String subject = body.get("subject");
        String message = body.get("message");

        if (to == null || subject == null || message == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields: to, subject, message"));
        }

        try {
            var params = CreateEmailOptions.builder()
                    .from(from)
                    .to(to)
                    .subject(subject)
                    .html("<p>" + message + "</p>")
                    .build();

            var response = resend.emails().send(params);
            return ResponseEntity.ok(Map.of("success", true, "id", response.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
