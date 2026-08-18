namespace ResendExamples;

using Resend;

public static class WithTemplate
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";
        var templateId = Environment.GetEnvironmentVariable("RESEND_TEMPLATE_ID") ?? "your-template-id";

        // Send email using a Resend hosted template
        // Template variables must match exactly (case-sensitive)
        // Do not use HtmlBody or TextBody when using a template
        var message = new EmailMessage
        {
            From = from,
            To = { "delivered@resend.dev" },
            Subject = "Email from Template - .NET Example",
            Template = new EmailMessageTemplate
            {
                TemplateId = templateId
            }
        };

        var response = await client.EmailSendAsync(message);

        Console.WriteLine("Email sent successfully!");
        Console.WriteLine($"Email ID: {response.Content}");
        Console.WriteLine($"Template ID: {templateId}");
    }
}
