package com.resend.examples;

import com.resend.Resend;
import com.resend.services.contacts.model.AddContactToSegmentOptions;
import com.resend.services.contacts.model.Contact;
import com.resend.services.contacts.model.CreateContactOptions;
import com.resend.services.contacts.model.CreateContactResponseSuccess;
import com.resend.services.contacts.model.UpdateContactOptions;
import com.resend.services.segments.model.Segment;
import io.github.cdimascio.dotenv.Dotenv;

public class Segments {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String apiKey = dotenv.get("RESEND_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("RESEND_API_KEY environment variable is required");
            System.exit(1);
        }

        Resend resend = new Resend(apiKey);

        String segmentId = dotenv.get("RESEND_SEGMENT_ID", "your-segment-id");

        try {
            // 1. List segments
            System.out.println("=== Listing Segments ===");
            var segments = resend.segments().list();
            for (Segment segment : segments.getData()) {
                System.out.println("  - " + segment.getName() + " (" + segment.getId() + ")");
            }

            // 2. Create a contact
            System.out.println("\n=== Creating Contact ===");
            CreateContactOptions createParams = CreateContactOptions.builder()
                    .email("clicked@resend.dev")
                    .firstName("Jane")
                    .lastName("Doe")
                    .unsubscribed(false)
                    .build();

            CreateContactResponseSuccess contact = resend.contacts().create(createParams);
            System.out.println("Contact created: " + contact.getId());

            // 3. Add the contact to the segment
            System.out.println("\n=== Adding Contact to Segment ===");
            resend.contacts().segments().add(AddContactToSegmentOptions.builder()
                    .id(contact.getId())
                    .segmentId(segmentId)
                    .build());
            System.out.println("Contact added to segment: " + segmentId);

            // 4. List contacts
            System.out.println("\n=== Listing Contacts ===");
            var contacts = resend.contacts().list(segmentId);
            for (Contact c : contacts.getData()) {
                System.out.println("  - " + c.getFirstName() + " " + c.getLastName()
                        + " <" + c.getEmail() + "> (unsubscribed: " + c.getUnsubscribed() + ")");
            }

            // 5. Update the contact
            System.out.println("\n=== Updating Contact ===");
            UpdateContactOptions updateParams = UpdateContactOptions.builder()
                    .id(contact.getId())
                    .firstName("Janet")
                    .unsubscribed(false)
                    .build();

            resend.contacts().update(updateParams);
            System.out.println("Contact updated: Jane -> Janet");

            // 6. Remove the contact
            System.out.println("\n=== Removing Contact ===");
            resend.contacts().remove(contact.getId());
            System.out.println("Contact removed: " + contact.getId());

            System.out.println("\nDone! Full segment/contact lifecycle complete.");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
