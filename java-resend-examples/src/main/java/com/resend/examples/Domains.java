package com.resend.examples;

import com.resend.Resend;
import com.resend.services.domains.model.DomainRecord;
import io.github.cdimascio.dotenv.Dotenv;

public class Domains {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        try {
            // 1. List all domains
            System.out.println("=== Listing Domains ===");
            var domains = resend.domains().list();
            var domainList = domains.getData();
            System.out.println("Found " + domainList.size() + " domain(s)");

            for (var domain : domainList) {
                System.out.println("  - " + domain.getName() + " (status: " + domain.getStatus() + ", id: " + domain.getId() + ")");
            }

            // 2. Get domain details (if any exist)
            if (!domainList.isEmpty()) {
                String domainId = domainList.get(0).getId();

                System.out.println("\n=== Domain Details: " + domainList.get(0).getName() + " ===");
                var domain = resend.domains().get(domainId);

                System.out.println("Name: " + domain.getName());
                System.out.println("Status: " + domain.getStatus());
                System.out.println("Region: " + domain.getRegion());
                System.out.println("Created: " + domain.getCreatedAt());

                var records = domain.getRecords();
                if (records != null && !records.isEmpty()) {
                    System.out.println("\nDNS Records:");
                    for (DomainRecord record : records) {
                        System.out.println("  " + record.getType() + ": " + record.getName() + " -> " + record.getValue());
                    }
                }

                // 3. Verify domain
                System.out.println("\n=== Verifying Domain ===");
                resend.domains().verify(domainId);
                System.out.println("Domain verification initiated!");
            }

            // To create a new domain (uncomment):
            // var createParams = CreateDomainOptions.builder()
            //         .name("mail.example.com")
            //         .region(Region.US_EAST_1)
            //         .build();
            // var newDomain = resend.domains().create(createParams);

            // To delete a domain (uncomment):
            // resend.domains().remove(domainId);

            System.out.println("\nDone!");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
