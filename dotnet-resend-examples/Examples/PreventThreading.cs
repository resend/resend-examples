namespace ResendExamples;

using Resend;

public static class PreventThreading
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        // Gmail groups emails into threads based on subject and Message-ID/References headers.
        // Adding a unique X-Entity-Ref-ID header per email prevents this grouping.
        for (var i = 1; i <= 3; i++)
        {
            var message = new EmailMessage
            {
                From = from,
                To = { "delivered@resend.dev" },
                Subject = "Order Confirmation", // Same subject for all
                HtmlBody = $"<h1>Order Confirmation</h1><p>This is email #{i} — each appears as a separate conversation in Gmail.</p>",
                Headers = { { "X-Entity-Ref-ID", Guid.NewGuid().ToString() } }
            };

            var response = await client.EmailSendAsync(message);
            Console.WriteLine($"Email #{i} sent: {response.Id}");
        }

        Console.WriteLine("\nAll emails sent with unique X-Entity-Ref-ID headers.");
        Console.WriteLine("Each will appear as a separate conversation in Gmail.");
    }
}
