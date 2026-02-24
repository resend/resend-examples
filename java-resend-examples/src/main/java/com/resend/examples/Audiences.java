package com.resend.examples;

import com.resend.Resend;
import com.resend.services.audiences.model.ListAudiencesResponseData;
import com.resend.services.contacts.model.CreateContactOptions;
import com.resend.services.contacts.model.CreateContactResponseData;
import com.resend.services.contacts.model.ListContactsResponseData;
import com.resend.services.contacts.model.UpdateContactOptions;
import io.github.cdimascio.dotenv.Dotenv;

public class Audiences {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String audienceId = dotenv.get("RESEND_AUDIENCE_ID", "your-audience-id");

        try {
            // 1. List audiences
            System.out.println("=== Listing Audiences ===");
            var audiences = resend.audiences().list();
            for (ListAudiencesResponseData audience : audiences.getData()) {
                System.out.println("  - " + audience.getName() + " (" + audience.getId() + ")");
            }

            // 2. Create a contact
            System.out.println("\n=== Creating Contact ===");
            CreateContactOptions createParams = CreateContactOptions.builder()
                    .audienceId(audienceId)
                    .email("clicked@resend.dev")
                    .firstName("Jane")
                    .lastName("Doe")
                    .unsubscribed(false)
                    .build();

            CreateContactResponseData contact = resend.contacts().create(createParams);
            System.out.println("Contact created: " + contact.getId());

            // 3. List contacts
            System.out.println("\n=== Listing Contacts ===");
            var contacts = resend.contacts().list(audienceId);
            for (ListContactsResponseData c : contacts.getData()) {
                System.out.println("  - " + c.getFirstName() + " " + c.getLastName()
                        + " <" + c.getEmail() + "> (unsubscribed: " + c.getUnsubscribed() + ")");
            }

            // 4. Update the contact
            System.out.println("\n=== Updating Contact ===");
            UpdateContactOptions updateParams = UpdateContactOptions.builder()
                    .audienceId(audienceId)
                    .id(contact.getId())
                    .firstName("Janet")
                    .unsubscribed(false)
                    .build();

            resend.contacts().update(updateParams);
            System.out.println("Contact updated: Jane -> Janet");

            // 5. Remove the contact
            System.out.println("\n=== Removing Contact ===");
            resend.contacts().remove(audienceId, contact.getId());
            System.out.println("Contact removed: " + contact.getId());

            System.out.println("\nDone! Full audience/contact lifecycle complete.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
