namespace ResendExamples;

using Resend;

public static class DoubleOptinSubscribe
{
    public static async Task RunAsync(string[] args)
    {
        if (args.Length < 1)
        {
            Console.WriteLine("Usage: dotnet run -- DoubleOptinSubscribe <email> [name]");
            Environment.Exit(1);
        }

        var email = args[0];
        var name = args.Length > 1 ? args[1] : "";

        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var audienceId = Environment.GetEnvironmentVariable("RESEND_AUDIENCE_ID")
            ?? throw new Exception("RESEND_AUDIENCE_ID environment variable is required");

        var confirmUrl = Environment.GetEnvironmentVariable("CONFIRM_REDIRECT_URL") ?? "https://example.com/confirmed";
        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        var client = new ResendClient(apiKey);

        // Step 1: Create contact with unsubscribed=true (pending confirmation)
        Console.WriteLine("Step 1: Creating contact (pending confirmation)...");
        var contact = await client.ContactCreateAsync(audienceId, new ContactData
        {
            Email = email,
            FirstName = name,
            Unsubscribed = true
        });
        Console.WriteLine($"Contact created: {contact.Id}");

        // Step 2: Send confirmation email
        Console.WriteLine("Step 2: Sending confirmation email...");
        var greeting = string.IsNullOrEmpty(name) ? "Welcome!" : $"Welcome, {name}!";

        var html = $@"<!DOCTYPE html>
<html>
<body style=""font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;"">
  <div style=""text-align: center; padding: 40px 20px;"">
    <h1 style=""color: #18181b; margin-bottom: 16px;"">{greeting}</h1>
    <p style=""color: #52525b; font-size: 16px; margin-bottom: 32px;"">Please confirm your subscription to our newsletter.</p>
    <a href=""{confirmUrl}"" style=""background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;"">Confirm Subscription</a>
    <p style=""color: #a1a1aa; font-size: 12px; margin-top: 32px;"">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>";

        var message = new EmailMessage
        {
            From = from,
            To = { email },
            Subject = "Confirm your subscription",
            HtmlBody = html
        };

        var sent = await client.EmailSendAsync(message);

        Console.WriteLine("\nDouble opt-in initiated!");
        Console.WriteLine($"Contact ID: {contact.Id}");
        Console.WriteLine($"Email ID: {sent.Id}");
        Console.WriteLine("\nNext steps:");
        Console.WriteLine("1. User clicks the confirmation link in the email");
        Console.WriteLine("2. Resend fires an 'email.clicked' webhook event");
        Console.WriteLine("3. Your webhook handler updates the contact to unsubscribed=false");
    }
}
