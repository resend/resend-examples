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

### Scheduled Sending
```bash
ruby examples/scheduled_send.rb
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
│   ├── basic_send.rb       # Simple email sending
│   ├── batch_send.rb       # Multiple emails at once
│   ├── with_attachments.rb # Emails with files
│   └── scheduled_send.rb   # Future delivery
├── sinatra_app/
│   └── app.rb              # Sinatra web app
├── rails_app/              # Rails API app
│   ├── app/controllers/
│   ├── config/
│   ├── Gemfile
│   └── README.md
├── Gemfile
├── .env.example
└── README.md
```

## Rails Integration

For Rails applications, you can use the Resend gem directly or configure it as a delivery method:

```ruby
# config/initializers/resend.rb
Resend.api_key = Rails.application.credentials.resend_api_key

# In a mailer
class UserMailer < ApplicationMailer
  def welcome(user)
    Resend::Emails.send({
      from: "Acme <hello@acme.com>",
      to: [user.email],
      subject: "Welcome!",
      html: render_to_string(template: "user_mailer/welcome")
    })
  end
end
```

## Resources

- [Resend Ruby SDK](https://github.com/resend/resend-ruby)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
