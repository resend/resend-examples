namespace ResendExamples;

using Resend;

public static class ScheduledSend
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        // Schedule for 5 minutes in the future (maximum: 7 days)
        var scheduledAt = DateTime.UtcNow.AddMinutes(5);

        var message = new EmailMessage
        {
            From = from,
            To = { "delivered@resend.dev" },
            Subject = "Scheduled Email from .NET",
            HtmlBody = "<h1>Hello from the future!</h1><p>This email was scheduled for later delivery.</p>",
            TextBody = "Hello from the future! This email was scheduled for later delivery.",
            ScheduledAt = scheduledAt
        };

        var response = await client.EmailSendAsync(message);

        Console.WriteLine("Email scheduled successfully!");
        Console.WriteLine($"Email ID: {response.Id}");
        Console.WriteLine($"Scheduled for: {scheduledAt:yyyy-MM-dd HH:mm:ss} UTC");
    }
}
