namespace ResendExamples;

using Resend;

public static class Audiences
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        // 1. List audiences
        Console.WriteLine("=== Listing Audiences ===");
        var audiences = await client.AudienceListAsync();
        foreach (var audience in audiences.Content)
        {
            Console.WriteLine($"  - {audience.Name} ({audience.Id})");
        }

        // 2. Create a contact
        // Contacts are account-level in the .NET SDK: they are not scoped to an
        // audience, so no audience id is passed to the contact operations below.
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

        // 3. List contacts
        Console.WriteLine("\n=== Listing Contacts ===");
        var contacts = await client.ContactListAsync();
        foreach (var c in contacts.Content.Data)
        {
            Console.WriteLine($"  - {c.FirstName} {c.LastName} <{c.Email}> (unsubscribed: {c.IsUnsubscribed})");
        }

        // 4. Update the contact
        Console.WriteLine("\n=== Updating Contact ===");
        await client.ContactUpdateAsync(contactId, new ContactData
        {
            FirstName = "Janet",
            IsUnsubscribed = false
        });
        Console.WriteLine("Contact updated: Jane -> Janet");

        // 5. Remove the contact
        Console.WriteLine("\n=== Removing Contact ===");
        await client.ContactDeleteAsync(contactId);
        Console.WriteLine($"Contact removed: {contactId}");

        Console.WriteLine("\nDone! Full audience/contact lifecycle complete.");
    }
}
