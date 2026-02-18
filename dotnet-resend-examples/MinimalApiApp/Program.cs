using Resend;
using Svix;
using System.Text.Json;

DotNetEnv.Env.Load();

var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
    ?? throw new Exception("RESEND_API_KEY environment variable is required");

var client = new ResendClient(apiKey);

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Json(new { status = "ok" }));

app.MapPost("/send", async (HttpRequest request) =>
{
    var body = await request.ReadFromJsonAsync<JsonElement>();

    var to = body.GetProperty("to").GetString();
    var subject = body.GetProperty("subject").GetString();
    var message = body.GetProperty("message").GetString();

    if (string.IsNullOrEmpty(to) || string.IsNullOrEmpty(subject) || string.IsNullOrEmpty(message))
    {
        return Results.BadRequest(new { error = "Missing required fields: to, subject, message" });
    }

    var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

    try
    {
        var email = new EmailMessage
        {
            From = from,
            To = { to },
            Subject = subject,
            HtmlBody = $"<p>{message}</p>"
        };

        var response = await client.EmailSendAsync(email);
        return Results.Ok(new { success = true, id = response.Id });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = ex.Message }, statusCode: 500);
    }
});

app.MapPost("/webhook", async (HttpRequest request) =>
{
    var svixId = request.Headers["svix-id"].FirstOrDefault();
    var svixTimestamp = request.Headers["svix-timestamp"].FirstOrDefault();
    var svixSignature = request.Headers["svix-signature"].FirstOrDefault();

    if (string.IsNullOrEmpty(svixId) || string.IsNullOrEmpty(svixTimestamp) || string.IsNullOrEmpty(svixSignature))
    {
        return Results.BadRequest(new { error = "Missing webhook headers" });
    }

    var webhookSecret = Environment.GetEnvironmentVariable("RESEND_WEBHOOK_SECRET");
    if (string.IsNullOrEmpty(webhookSecret))
    {
        return Results.Json(new { error = "Webhook secret not configured" }, statusCode: 500);
    }

    using var reader = new StreamReader(request.Body);
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

        return Results.Ok(new { received = true, type = eventType });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.MapPost("/double-optin/subscribe", async (HttpRequest request) =>
{
    var body = await request.ReadFromJsonAsync<JsonElement>();

    var email = body.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null;
    var name = body.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "";

    if (string.IsNullOrEmpty(email))
    {
        return Results.BadRequest(new { error = "Missing required field: email" });
    }

    var audienceId = Environment.GetEnvironmentVariable("RESEND_AUDIENCE_ID");
    if (string.IsNullOrEmpty(audienceId))
    {
        return Results.Json(new { error = "RESEND_AUDIENCE_ID not configured" }, statusCode: 500);
    }

    var confirmUrl = Environment.GetEnvironmentVariable("CONFIRM_REDIRECT_URL") ?? "https://example.com/confirmed";
    var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

    try
    {
        var contact = await client.ContactCreateAsync(audienceId, new ContactData
        {
            Email = email,
            FirstName = name,
            Unsubscribed = true
        });

        var greeting = string.IsNullOrEmpty(name) ? "Welcome!" : $"Welcome, {name}!";
        var html = $@"<div style=""text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;"">
  <h1>{greeting}</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href=""{confirmUrl}"" style=""background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;"">Confirm Subscription</a>
</div>";

        var emailMessage = new EmailMessage
        {
            From = from,
            To = { email },
            Subject = "Confirm your subscription",
            HtmlBody = html
        };

        var sent = await client.EmailSendAsync(emailMessage);

        return Results.Ok(new
        {
            success = true,
            message = "Confirmation email sent",
            contact_id = contact.Id,
            email_id = sent.Id
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new { error = ex.Message }, statusCode: 500);
    }
});

app.MapPost("/double-optin/webhook", async (HttpRequest request) =>
{
    var webhookSecret = Environment.GetEnvironmentVariable("RESEND_WEBHOOK_SECRET");
    if (string.IsNullOrEmpty(webhookSecret))
    {
        return Results.Json(new { error = "Webhook secret not configured" }, statusCode: 500);
    }

    using var reader = new StreamReader(request.Body);
    var payload = await reader.ReadToEndAsync();

    try
    {
        var wh = new Webhook(webhookSecret);
        var headers = new System.Net.WebHeaderCollection
        {
            { "svix-id", request.Headers["svix-id"].FirstOrDefault()! },
            { "svix-timestamp", request.Headers["svix-timestamp"].FirstOrDefault()! },
            { "svix-signature", request.Headers["svix-signature"].FirstOrDefault()! }
        };

        wh.Verify(payload, headers);

        var eventData = JsonDocument.Parse(payload).RootElement;
        var eventType = eventData.GetProperty("type").GetString()!;

        if (eventType != "email.clicked")
        {
            return Results.Ok(new { received = true, type = eventType, message = "Event type ignored" });
        }

        var audienceId = Environment.GetEnvironmentVariable("RESEND_AUDIENCE_ID")!;
        var recipientEmail = eventData.GetProperty("data").GetProperty("to")[0].GetString()!;

        var contacts = await client.ContactListAsync(audienceId);
        string? contactId = null;
        foreach (var c in contacts.Data)
        {
            if (c.Email == recipientEmail)
            {
                contactId = c.Id;
                break;
            }
        }

        if (contactId == null)
        {
            return Results.NotFound(new { error = "Contact not found" });
        }

        await client.ContactUpdateAsync(audienceId, contactId, new ContactData { Unsubscribed = false });

        return Results.Ok(new
        {
            received = true,
            type = eventType,
            confirmed = true,
            email = recipientEmail,
            contact_id = contactId
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.Run("http://localhost:3000");
