# Symfony + Resend Example

## Setup

```bash
cd symfony_app

# Install dependencies
composer install

# Set environment variables in ../.env

# Run the server
php -S localhost:8080 public/index.php
```

## Endpoints

- `GET /health` — Health check
- `POST /send` — Send an email
- `POST /send-prevent-threading` — Send email that won't thread in Gmail
- `POST /send-batch` — Send batch emails (up to 100)
- `POST /send-attachment` — Send email with attachment
- `POST /send-cid` — Send email with CID inline image
- `POST /send-scheduled` — Send a scheduled email
- `POST /send-template` — Send email using a Resend template
- `GET /domains` — List all domains
- `POST /domains` — Create a domain
- `GET /audiences/contacts` — List contacts in an audience
- `POST /webhook` — Handle Resend webhook events
- `POST /double-optin/subscribe` — Subscribe with confirmation
- `POST /double-optin/webhook` — Confirm subscription on click

## Test

```bash
curl -X POST http://localhost:8080/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Symfony!"}'
```
