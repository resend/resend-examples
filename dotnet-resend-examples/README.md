# .NET (C#) + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using .NET and C#.

## Prerequisites

- .NET 8.0+
- A [Resend](https://resend.com) account

## Installation

```bash
# Restore dependencies
dotnet restore

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
dotnet run -- BasicSend
```

### Batch Sending
```bash
dotnet run -- BatchSend
```

### With Attachments
```bash
dotnet run -- WithAttachments
```

### With CID (Inline) Attachments
```bash
dotnet run -- WithCidAttachments
```

### Scheduled Sending
```bash
dotnet run -- ScheduledSend
```

### Using Templates
```bash
dotnet run -- WithTemplate
```

### Prevent Gmail Threading
```bash
dotnet run -- PreventThreading
```

### Audiences & Contacts
```bash
dotnet run -- Audiences
```

### Domain Management
```bash
dotnet run -- Domains
```

### Inbound Email
```bash
dotnet run -- Inbound
```

### Double Opt-In
```bash
# Subscribe (creates contact + sends confirmation)
dotnet run -- DoubleOptinSubscribe user@example.com "John Doe"

# Webhook handler (confirms subscription on click)
# See MinimalApiApp/ or MvcApp/ for web endpoint
```

### Minimal API Application
```bash
cd MinimalApiApp
dotnet run

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from .NET Minimal API!"}'
```

### MVC Application
```bash
cd MvcApp
dotnet run

# Then in another terminal:
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from ASP.NET MVC!"}'
```

## Quick Usage

```csharp
using Resend;

var client = new ResendClient("re_xxxxxxxxx");

var message = new EmailMessage
{
    From = "Acme <onboarding@resend.dev>",
    To = { "delivered@resend.dev" },
    Subject = "Hello",
    HtmlBody = "<p>Hello World</p>"
};

var response = await client.EmailSendAsync(message);
Console.WriteLine($"Email ID: {response.Id}");
```

## Project Structure

```
dotnet-resend-examples/
├── Examples/
│   ├── BasicSend.cs                 # Simple email sending
│   ├── BatchSend.cs                 # Multiple emails at once
│   ├── WithAttachments.cs           # Emails with files
│   ├── WithCidAttachments.cs        # Inline images
│   ├── ScheduledSend.cs             # Future delivery
│   ├── WithTemplate.cs              # Using Resend templates
│   ├── PreventThreading.cs          # Prevent Gmail threading
│   ├── Audiences.cs                 # Manage contacts
│   ├── Domains.cs                   # Manage domains
│   ├── Inbound.cs                   # Handle inbound emails
│   ├── DoubleOptinSubscribe.cs      # Create contact + send confirmation
│   └── DoubleOptinWebhook.cs        # Process confirmation click
├── MinimalApiApp/
│   ├── Program.cs                   # ASP.NET Minimal API app
│   └── MinimalApiApp.csproj
├── MvcApp/
│   ├── Controllers/                 # ASP.NET MVC controllers
│   ├── Program.cs
│   └── MvcApp.csproj
├── dotnet-resend-examples.csproj
├── Program.cs                       # CLI dispatcher
├── .env.example
└── README.md
```

## Resources

- [Resend .NET SDK](https://github.com/resend/resend-dotnet)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## Contributing

See something that could be improved? We welcome contributions! [Open an issue](https://github.com/resend/resend-examples/issues) to report a bug or suggest an improvement, or [submit a pull request](https://github.com/resend/resend-examples/pulls) with your changes.

## License

MIT
