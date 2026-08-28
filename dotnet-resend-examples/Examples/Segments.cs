namespace ResendExamples;

using Resend;

public static class Segments
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        // 1. List segments
        Console.WriteLine("=== Listing Segments ===");
        var segments = await client.SegmentListAsync();
        foreach (var segment in segments.Content.Data)
        {
            Console.WriteLine($"  - {segment.Name} ({segment.Id})");
        }

        // 2. Create a contact
        // Contacts are account-level in the .NET SDK: they are not scoped to a
        // segment, so assigning a contact to a segment is a separate call (step 3).
        Console.WriteLine("\n=== Creating Contact ===");
        var contact = await client.ContactAddAsync(new ContactData
        {
            Email = "clicked@resend.dev",
            FirstName = "Jane",
            LastName = "Doe",
            IsUnsubscribed = false
        });
        var contactId = contact.Content;
        Console.WriteLine($"Contact created: {contactId}");

        // 3. Add the contact to a segment
        var segmentIdValue = Environment.GetEnvironmentVariable("RESEND_SEGMENT_ID");
        if (!string.IsNullOrEmpty(segmentIdValue) && Guid.TryParse(segmentIdValue, out var segmentId))
        {
            Console.WriteLine("\n=== Adding Contact to Segment ===");
            await client.ContactAddToSegmentAsync(contactId, segmentId);
            Console.WriteLine($"Contact {contactId} added to segment {segmentId}");
        }
        else
        {
            Console.WriteLine("\nSkipping segment assignment: set RESEND_SEGMENT_ID to a valid segment id to try this step.");
        }

        // 4. List contacts
        Console.WriteLine("\n=== Listing Contacts ===");
        var contacts = await client.ContactListAsync();
        foreach (var c in contacts.Content.Data)
        {
            Console.WriteLine($"  - {c.FirstName} {c.LastName} <{c.Email}> (unsubscribed: {c.IsUnsubscribed})");
        }

        // 5. Update the contact
        Console.WriteLine("\n=== Updating Contact ===");
        await client.ContactUpdateAsync(contactId, new ContactData
        {
            FirstName = "Janet",
            IsUnsubscribed = false
        });
        Console.WriteLine("Contact updated: Jane -> Janet");

        // 6. Remove the contact
        Console.WriteLine("\n=== Removing Contact ===");
        await client.ContactDeleteAsync(contactId);
        Console.WriteLine($"Contact removed: {contactId}");

        Console.WriteLine("\nDone! Full segment/contact lifecycle complete.");
    }
}
