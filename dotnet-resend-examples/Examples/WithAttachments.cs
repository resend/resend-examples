namespace ResendExamples;

using Resend;

public static class WithAttachments
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        // Create sample file content
        var fileContent = $"Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: {DateTime.UtcNow:O}\n";
        var encoded = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(fileContent));

        // Maximum total attachment size: 40MB
        var message = new EmailMessage
        {
            From = from,
            To = { "delivered@resend.dev" },
            Subject = "Email with Attachment - .NET Example",
            HtmlBody = "<h1>Your attachment is ready</h1><p>Please find the file attached to this email.</p>",
            Attachments =
            {
                new EmailAttachment { FileName = "sample.txt", Content = encoded }
            }
        };

        var response = await client.EmailSendAsync(message);

        Console.WriteLine("Email with attachment sent successfully!");
        Console.WriteLine($"Email ID: {response.Id}");
    }
}
