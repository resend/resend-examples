namespace ResendExamples;

using Resend;

public static class BasicSend
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        var message = new EmailMessage
        {
            From = from,
            To = { "delivered@resend.dev" },
            Subject = "Hello from Resend .NET!",
            HtmlBody = "<h1>Welcome!</h1><p>This email was sent using Resend's .NET SDK.</p>",
            TextBody = "Welcome! This email was sent using Resend's .NET SDK."
        };

        var response = await client.EmailSendAsync(message);

        Console.WriteLine("Email sent successfully!");
        Console.WriteLine($"Email ID: {response.Id}");
    }
}
