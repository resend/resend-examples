namespace ResendExamples;

using Resend;

public static class Audiences
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var audienceId = Environment.GetEnvironmentVariable("RESEND_AUDIENCE_ID") ?? "your-audience-id";

        // 1. List audiences
        Console.WriteLine("=== Listing Audiences ===");
        var audiences = await client.AudienceListAsync();
        foreach (var audience in audiences.Data)
        {
            Console.WriteLine($"  - {audience.Name} ({audience.Id})");
        }

        // 2. Create a contact
        Console.WriteLine("\n=== Creating Contact ===");
        var contact = await client.ContactCreateAsync(audienceId, new ContactData
        {
            Email = "clicked@resend.dev",
            FirstName = "Jane",
            LastName = "Doe",
            Unsubscribed = false
        });
        Console.WriteLine($"Contact created: {contact.Id}");

        // 3. List contacts
        Console.WriteLine("\n=== Listing Contacts ===");
        var contacts = await client.ContactListAsync(audienceId);
        foreach (var c in contacts.Data)
        {
            Console.WriteLine($"  - {c.FirstName} {c.LastName} <{c.Email}> (unsubscribed: {c.Unsubscribed})");
        }

        // 4. Update the contact
        Console.WriteLine("\n=== Updating Contact ===");
        await client.ContactUpdateAsync(audienceId, contact.Id, new ContactData
        {
            FirstName = "Janet",
            Unsubscribed = false
        });
        Console.WriteLine("Contact updated: Jane -> Janet");

        // 5. Remove the contact
        Console.WriteLine("\n=== Removing Contact ===");
        await client.ContactRemoveAsync(audienceId, contact.Id);
        Console.WriteLine($"Contact removed: {contact.Id}");

        Console.WriteLine("\nDone! Full audience/contact lifecycle complete.");
    }
}
