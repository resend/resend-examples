namespace ResendExamples;

using Resend;
using System.Text.Json;

/// <summary>
/// Processes the email.clicked webhook event to confirm a double opt-in subscription.
/// In production, this logic runs inside your web framework's webhook handler.
/// </summary>
public static class DoubleOptinWebhook
{
    public static async Task<Dictionary<string, object>> ProcessDoubleOptinWebhookAsync(
        ResendClient client, string audienceId, JsonElement eventData)
    {
        var eventType = eventData.GetProperty("type").GetString()!;

        // Only process email.clicked events
        if (eventType != "email.clicked")
        {
            return new Dictionary<string, object>
            {
                ["received"] = true,
                ["type"] = eventType,
                ["message"] = "Event type ignored"
            };
        }

        // Extract recipient email from webhook payload
        var data = eventData.GetProperty("data");
        var toArray = data.GetProperty("to");
        var recipientEmail = toArray[0].GetString()
            ?? throw new Exception("No recipient email in webhook data");

        // Find the contact by email
        var contacts = await client.ContactListAsync(audienceId);
        string? contactId = null;

        foreach (var c in contacts.Data)
        {
            if (c.Email == recipientEmail)
            {
                contactId = c.Id;
                break;
            }
        }

        if (contactId == null)
        {
            throw new Exception($"Contact not found: {recipientEmail}");
        }

        // Update contact: confirm subscription
        await client.ContactUpdateAsync(audienceId, contactId, new ContactData
        {
            Unsubscribed = false
        });

        return new Dictionary<string, object>
        {
            ["received"] = true,
            ["type"] = eventType,
            ["confirmed"] = true,
            ["email"] = recipientEmail,
            ["contact_id"] = contactId
        };
    }

    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var audienceId = Environment.GetEnvironmentVariable("RESEND_AUDIENCE_ID")
            ?? throw new Exception("RESEND_AUDIENCE_ID environment variable is required");

        var client = new ResendClient(apiKey);

        // Simulate a webhook event (in production, this comes from Resend)
        var sampleJson = """
        {
            "type": "email.clicked",
            "data": {
                "to": ["clicked@resend.dev"]
            }
        }
        """;

        var eventData = JsonDocument.Parse(sampleJson).RootElement;

        Console.WriteLine("Processing double opt-in webhook event...");
        var result = await ProcessDoubleOptinWebhookAsync(client, audienceId, eventData);

        foreach (var kvp in result)
        {
            Console.WriteLine($"  {kvp.Key}: {kvp.Value}");
        }
    }
}
