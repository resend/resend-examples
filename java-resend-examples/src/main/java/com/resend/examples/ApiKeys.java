package com.resend.examples;

import com.resend.Resend;
import com.resend.services.apikeys.model.ApiKey;
import com.resend.services.apikeys.model.CreateApiKeyOptions;
import com.resend.services.apikeys.model.CreateApiKeyResponse;
import com.resend.services.apikeys.model.ListApiKeysResponse;
import com.resend.services.apikeys.model.UpdateApiKeyOptions;
import com.resend.services.apikeys.model.UpdateApiKeyResponseSuccess;
import io.github.cdimascio.dotenv.Dotenv;

public class ApiKeys {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        try {
            // 1. Create an API key
            System.out.println("=== Creating API Key ===");
            CreateApiKeyOptions createParams = CreateApiKeyOptions.builder()
                    .name("Example Key")
                    .build();

            CreateApiKeyResponse created = resend.apiKeys().create(createParams);
            System.out.println("API key created: " + created.getId());
            System.out.println("Token (only shown once, store it now): " + created.getToken());

            // 2. Rename the API key
            // Only the name can be changed after creation - permission and domain_id
            // are fixed at creation time, so a leaked key can never be widened in scope.
            System.out.println("\n=== Renaming API Key ===");
            UpdateApiKeyOptions updateParams = UpdateApiKeyOptions.builder()
                    .name("Example Key (renamed)")
                    .build();

            UpdateApiKeyResponseSuccess updated = resend.apiKeys().update(created.getId(), updateParams);
            System.out.println("API key renamed: " + updated.getId());

            // 3. List all API keys
            System.out.println("\n=== Listing API Keys ===");
            ListApiKeysResponse list = resend.apiKeys().list();
            var keys = list.getData();
            System.out.println("Found " + keys.size() + " API key(s)");

            for (ApiKey key : keys) {
                System.out.println("  - " + key.getName() + " (id: " + key.getId()
                        + ", created: " + key.getCreatedAt()
                        + ", last used: " + key.getLastUsedAt() + ")");
            }

            // 4. Delete the API key
            // There is no endpoint to fetch a single api key - list() is the
            // only way to look one up after creation.
            System.out.println("\n=== Deleting API Key ===");
            resend.apiKeys().remove(created.getId());
            System.out.println("API key deleted: " + created.getId());

            System.out.println("\nDone! Full API key lifecycle complete.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
