# Ruby + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Ruby.

## Prerequisites

- Ruby 3.1+
- Bundler
- A [Resend](https://resend.com) account

## Installation

```bash
# Install dependencies
bundle install

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
ruby examples/basic_send.rb
```

### Batch Sending
```bash
ruby examples/batch_send.rb
```

### With Attachments
```bash
ruby examples/with_attachments.rb
```

### With CID (Inline) Attachments
```bash
ruby examples/with_cid_attachments.rb
```

### Scheduled Sending
```bash
ruby examples/scheduled_send.rb
```

### Using Templates
```bash
ruby examples/with_template.rb
```

### Prevent Gmail Threading
```bash
ruby examples/prevent_threading.rb
```

### Audiences & Contacts
```bash
ruby examples/audiences.rb
```

### Domain Management
```bash
ruby examples/domains.rb
```

### Inbound Email
```bash
ruby examples/inbound.rb
```

### Sinatra Application
```bash
ruby sinatra_app/app.rb

# Then in another terminal:
curl -X POST http://localhost:4567/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi!"}'
```

### Rails Application
```bash
cd rails_app
bundle install
bin/rails server -p 3000

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Rails!"}'
```

## Quick Usage

```ruby
require "resend"

Resend.api_key = "re_xxxxxxxxx"

# Send a basic email
result = Resend::Emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Hello",
  html: "<p>Hello World</p>"
})

puts "Email ID: #{result["id"]}"
```

## Project Structure

```
ruby-resend-examples/
├── examples/
│   ├── basic_send.rb          # Simple email sending
│   ├── batch_send.rb          # Multiple emails at once
│   ├── with_attachments.rb    # Emails with files
│   ├── with_cid_attachments.rb # Inline images
│   ├── scheduled_send.rb      # Future delivery
│   ├── with_template.rb       # Using Resend templates
│   ├── prevent_threading.rb   # Prevent Gmail threading
│   ├── audiences.rb           # Manage contacts
│   ├── domains.rb             # Manage domains
│   └── inbound.rb             # Handle inbound emails
├── sinatra_app/
│   └── app.rb                 # Sinatra web app
├── rails_app/                 # Rails API app
│   ├── app/controllers/
│   ├── config/
│   ├── Gemfile
│   └── README.md
├── Gemfile
├── .env.example
└── README.md
```

## Resources

- [Resend Ruby SDK](https://github.com/resend/resend-ruby)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
