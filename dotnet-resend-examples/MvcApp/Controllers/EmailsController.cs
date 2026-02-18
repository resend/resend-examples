using Microsoft.AspNetCore.Mvc;
using Resend;

namespace MvcApp.Controllers;

[ApiController]
public class EmailsController : ControllerBase
{
    private readonly ResendClient _client;

    public EmailsController(ResendClient client)
    {
        _client = client;
    }

    [HttpPost("/send")]
    public async Task<IActionResult> Send([FromBody] SendRequest body)
    {
        if (string.IsNullOrEmpty(body.To) || string.IsNullOrEmpty(body.Subject) || string.IsNullOrEmpty(body.Message))
        {
            return BadRequest(new { error = "Missing required fields: to, subject, message" });
        }

        var from = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>";

        try
        {
            var message = new EmailMessage
            {
                From = from,
                To = { body.To },
                Subject = body.Subject,
                HtmlBody = $"<p>{body.Message}</p>"
            };

            var response = await _client.EmailSendAsync(message);
            return Ok(new { success = true, id = response.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public record SendRequest(string? To, string? Subject, string? Message);
