# Rails + Resend Example

A minimal Rails API application demonstrating Resend integration.

## Setup

```bash
cd rails_app
bundle install
```

## Running

```bash
# From the rails_app directory
bin/rails server -p 3000

# Or with bundle
bundle exec rails server -p 3000
```

## Endpoints

### Send Email
```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Rails!"}'
```

### Webhook Handler
```bash
# Resend will POST webhook events to this endpoint
POST http://localhost:3000/webhook
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Environment Variables

Create a `.env` file in the parent directory or set these environment variables:

- `RESEND_API_KEY` - Your Resend API key (required)
- `EMAIL_FROM` - Default sender address (optional, defaults to `Acme <onboarding@resend.dev>`)
- `RESEND_WEBHOOK_SECRET` - Webhook signing secret for verification (required for webhooks)
