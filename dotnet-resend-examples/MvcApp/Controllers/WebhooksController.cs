using Microsoft.AspNetCore.Mvc;
using Svix;
using System.Text.Json;

namespace MvcApp.Controllers;

[ApiController]
public class WebhooksController : ControllerBase
{
    [HttpPost("/webhook")]
    public async Task<IActionResult> HandleWebhook()
    {
        var svixId = Request.Headers["svix-id"].FirstOrDefault();
        var svixTimestamp = Request.Headers["svix-timestamp"].FirstOrDefault();
        var svixSignature = Request.Headers["svix-signature"].FirstOrDefault();

        if (string.IsNullOrEmpty(svixId) || string.IsNullOrEmpty(svixTimestamp) || string.IsNullOrEmpty(svixSignature))
        {
            return BadRequest(new { error = "Missing webhook headers" });
        }

        var webhookSecret = Environment.GetEnvironmentVariable("RESEND_WEBHOOK_SECRET");
        if (string.IsNullOrEmpty(webhookSecret))
        {
            return StatusCode(500, new { error = "Webhook secret not configured" });
        }

        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();

        try
        {
            var wh = new Webhook(webhookSecret);
            var headers = new System.Net.WebHeaderCollection
            {
                { "svix-id", svixId },
                { "svix-timestamp", svixTimestamp },
                { "svix-signature", svixSignature }
            };

            wh.Verify(payload, headers);

            var eventData = JsonDocument.Parse(payload).RootElement;
            var eventType = eventData.GetProperty("type").GetString()!;

            Console.WriteLine($"Received webhook event: {eventType}");

            switch (eventType)
            {
                case "email.received":
                    Console.WriteLine($"New email from: {eventData.GetProperty("data").GetProperty("from").GetString()}");
                    break;
                case "email.delivered":
                    Console.WriteLine($"Email delivered: {eventData.GetProperty("data").GetProperty("email_id").GetString()}");
                    break;
                case "email.bounced":
                    Console.WriteLine($"Email bounced: {eventData.GetProperty("data").GetProperty("email_id").GetString()}");
                    break;
            }

            return Ok(new { received = true, type = eventType });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
