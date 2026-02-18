# Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) across multiple languages and frameworks.

## Quick Start

Choose your language/framework and follow the setup instructions in each folder:

| Language | Folder | Framework |
|----------|--------|-----------|
| **Next.js (TypeScript)** | [`/nextjs-resend-examples/typescript`](/nextjs-resend-examples/typescript/) | Next.js 16, React 19 |
| **Next.js (JavaScript)** | [`/nextjs-resend-examples/javascript`](/nextjs-resend-examples/javascript/) | Next.js 16, React 19 |
| **PHP** | [`/php-resend-examples`](/php-resend-examples/) | PHP 8.2+ |
| **Laravel** | [`/laravel-resend-examples`](/laravel-resend-examples/) | Laravel 11 |
| **Python** | [`/python-resend-examples`](/python-resend-examples/) | Flask, FastAPI |
| **Ruby** | [`/ruby-resend-examples`](/ruby-resend-examples/) | Sinatra, Rails |
| **Go** | [`/go-resend-examples`](/go-resend-examples/) | Chi, Gin |
| **Java** | [`/java-resend-examples`](/java-resend-examples/) | Javalin, Spring Boot |
| **.NET (C#)** | [`/dotnet-resend-examples`](/dotnet-resend-examples/) | ASP.NET Minimal APIs, ASP.NET MVC |
| **Rust** | [`/rust-resend-examples`](/rust-resend-examples/) | Axum |
| **Elixir** | [`/elixir-resend-examples`](/elixir-resend-examples/) | Phoenix |

## Examples Included

Each language folder includes examples for:

### Sending Emails
- **Basic Send** - Simple HTML email
- **With Attachments** - File attachments (URL or base64)
- **With CID Attachments** - Inline/embedded images
- **With Templates** - Resend hosted templates
- **With React Email** - React component templates (Next.js only)
- **Scheduled Send** - Future delivery scheduling

### Forms & Server Actions
- **Contact Form** - Batch send with confirmation + notification

### Receiving Emails
- **Inbound Webhooks** - Receive and forward emails
- **Webhook Verification** - Signature validation

### Management
- **Audiences** - Contacts and segments
- **Domains** - Create and verify domains

### Advanced
- **Authentication** - Email verification with better-auth
- **Prevent Threading** - Stop Gmail conversation grouping

## Getting Started

1. **Get your API key** from [resend.com/api-keys](https://resend.com/api-keys)

2. **Clone this repository**:
   ```bash
   git clone https://github.com/resend/resend-examples.git
   ```

3. **Choose your language** and follow the README in that folder

4. **Configure your environment** with your API key

5. **Run the examples** and explore!

## Resources

- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)
- [React Email](https://react.email)
- [Dashboard](https://resend.com/emails)

## License

MIT
