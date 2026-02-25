namespace ResendExamples;

using Resend;

public static class BatchSend
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";
        var contactEmail = Environment.GetEnvironmentVariable("CONTACT_EMAIL") ?? "delivered@resend.dev";

        // Batch send: up to 100 emails per call
        // Note: Batch send does not support attachments or scheduling
        var emails = new[]
        {
            new EmailMessage
            {
                From = from,
                To = { "delivered@resend.dev" },
                Subject = "We received your message",
                HtmlBody = "<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>"
            },
            new EmailMessage
            {
                From = from,
                To = { contactEmail },
                Subject = "New contact form submission",
                HtmlBody = "<h1>New message received</h1><p>From: delivered@resend.dev</p>"
            }
        };

        var response = await client.BatchEmailSendAsync(emails);

        Console.WriteLine("Batch sent successfully!");
        for (var i = 0; i < response.Data.Count; i++)
        {
            Console.WriteLine($"Email {i + 1} ID: {response.Data[i].Id}");
        }
    }
}
