# Elixir + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Elixir.

## Prerequisites

- Elixir 1.15+
- A [Resend](https://resend.com) account

## Installation

```bash
# Install dependencies
mix deps.get

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
mix run examples/basic_send.exs
```

### Batch Sending
```bash
mix run examples/batch_send.exs
```

### With Attachments
```bash
mix run examples/with_attachments.exs
```

### With CID (Inline) Attachments
```bash
mix run examples/with_cid_attachments.exs
```

### Scheduled Sending
```bash
mix run examples/scheduled_send.exs
```

### Using Templates
```bash
mix run examples/with_template.exs
```

### Prevent Gmail Threading
```bash
mix run examples/prevent_threading.exs
```

### Audiences & Contacts
```bash
mix run examples/audiences.exs
```

### Domain Management
```bash
mix run examples/domains.exs
```

### Inbound Email
```bash
mix run examples/inbound.exs
```

### Double Opt-In
```bash
# Subscribe (creates contact + sends confirmation)
mix run examples/double_optin/subscribe.exs user@example.com "John Doe"

# Webhook handler (confirms subscription on click)
# See phoenix_app/ for web endpoint
```

### Phoenix Application
```bash
cd phoenix_app
mix deps.get
mix phx.server

# Then in another terminal:
curl -X POST http://localhost:4000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Phoenix!"}'
```

## Quick Usage

```elixir
# In your config:
config :resend, api_key: "re_xxxxxxxxx"

# Send an email:
{:ok, %{"id" => id}} = Resend.Emails.send(%{
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Hello",
  html: "<p>Hello World</p>"
})

IO.puts("Email ID: #{id}")
```

## Project Structure

```
elixir-resend-examples/
├── examples/
│   ├── basic_send.exs               # Simple email sending
│   ├── batch_send.exs               # Multiple emails at once
│   ├── with_attachments.exs         # Emails with files
│   ├── with_cid_attachments.exs     # Inline images
│   ├── scheduled_send.exs           # Future delivery
│   ├── with_template.exs            # Using Resend templates
│   ├── prevent_threading.exs        # Prevent Gmail threading
│   ├── audiences.exs                # Manage contacts
│   ├── domains.exs                  # Manage domains
│   ├── inbound.exs                  # Handle inbound emails
│   └── double_optin/
│       ├── subscribe.exs            # Create contact + send confirmation
│       └── webhook.exs              # Process confirmation click
├── phoenix_app/                     # Phoenix web app
│   ├── lib/
│   ├── config/
│   └── mix.exs
├── mix.exs
├── config/
├── .env.example
└── README.md
```

## Resources

- [Resend Elixir SDK](https://hex.pm/packages/resend)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
