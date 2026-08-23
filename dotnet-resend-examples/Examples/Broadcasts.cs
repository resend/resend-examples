namespace ResendExamples;

using Resend;

public static class Broadcasts
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";
        var segmentId = Guid.Parse(Environment.GetEnvironmentVariable("RESEND_SEGMENT_ID") ?? "00000000-0000-0000-0000-000000000000");

        // 1. Create a draft broadcast targeting a segment
        Console.WriteLine("=== Creating Broadcast ===");

        var created = await client.BroadcastAddAsync(new BroadcastData
        {
            DisplayName = "August Newsletter",
            SegmentId = segmentId,
            From = from,
            Subject = "Hello from Resend .NET!",
            HtmlBody = "<h1>Welcome!</h1><p>This broadcast was sent using Resend's .NET SDK.</p>",
            TextBody = "Welcome! This broadcast was sent using Resend's .NET SDK."
        });

        var broadcastId = created.Content;
        Console.WriteLine($"Broadcast created: {broadcastId}");

        // 2. Send the broadcast
        Console.WriteLine("\n=== Sending Broadcast ===");
        await client.BroadcastSendAsync(broadcastId);
        Console.WriteLine($"Broadcast sent: {broadcastId}");

        // 3. List the recipients the broadcast was sent to
        Console.WriteLine("\n=== Listing Broadcast Recipients ===");

        var recipients = await client.BroadcastListRecipientsAsync(broadcastId, BroadcastRecipientEventType.Sent);
        Console.WriteLine($"Found {recipients.Content.Data.Count} recipient(s) sent to");

        Console.WriteLine("\nDone! Broadcast lifecycle complete. Sent broadcasts can't be deleted, so there's no cleanup step.");
    }
}
