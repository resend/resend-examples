namespace ResendExamples;

using Resend;

public static class WithCidAttachments
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        // Minimal 1x1 PNG placeholder (base64-encoded)
        // In production, replace with your actual image file
        var placeholderImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        // Use Content-ID (CID) to reference inline images in HTML
        // The "cid:logo" in HTML matches the ContentId "logo" in the attachment
        var html = @"<div style=""font-family: Arial, sans-serif; padding: 20px;"">
  <img src=""cid:logo"" alt=""Company Logo"" width=""100"" height=""100"" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
  <p>The image above is embedded directly in the email, not as a downloadable attachment.</p>
</div>";

        var message = new EmailMessage
        {
            From = from,
            To = { "delivered@resend.dev" },
            Subject = "Email with Inline Image - .NET Example",
            HtmlBody = html,
            Attachments =
            {
                new EmailAttachment
                {
                    FileName = "logo.png",
                    Content = placeholderImage,
                    ContentId = "logo"
                }
            }
        };

        var response = await client.EmailSendAsync(message);

        Console.WriteLine("Email with inline image sent successfully!");
        Console.WriteLine($"Email ID: {response.Id}");
    }
}
