namespace ResendExamples;

using Resend;

public static class Inbound
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        // This example fetches a previously received inbound email by ID.
        // The email ID comes from an "email.received" webhook event payload.
        // Set up inbound webhooks at: https://resend.com/webhooks
        var emailId = Environment.GetEnvironmentVariable("INBOUND_EMAIL_ID") ?? "example-email-id";

        if (emailId == "example-email-id")
        {
            Console.WriteLine("Note: Set INBOUND_EMAIL_ID to fetch a real inbound email.");
            Console.WriteLine("You get this ID from the 'email.received' webhook event.\n");
        }

        var email = await client.EmailRetrieveAsync(emailId);

        Console.WriteLine("=== Inbound Email Details ===");
        Console.WriteLine($"From: {email.From}");
        Console.WriteLine($"To: {string.Join(", ", email.To)}");
        Console.WriteLine($"Subject: {email.Subject}");
        Console.WriteLine($"Created: {email.CreatedAt}");

        if (!string.IsNullOrEmpty(email.Text))
        {
            var preview = email.Text.Length > 200 ? email.Text[..200] + "..." : email.Text;
            Console.WriteLine($"\nText preview:\n{preview}");
        }

        Console.WriteLine("\nDone!");
    }
}
