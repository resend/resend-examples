# Django + Resend Example

## Setup

```bash
cd django_app

# Install dependencies (from parent directory)
pip install -r ../requirements.txt
pip install django

# Set environment variables in ../.env

# Run the server
python manage.py runserver 8001
```

## Endpoints

- `GET /health` — Health check
- `POST /send` — Send an email
- `POST /send-attachment` — Send email with attachment
- `POST /send-cid` — Send email with CID inline image
- `POST /send-scheduled` — Send a scheduled email
- `POST /send-template` — Send email using a Resend template
- `POST /webhook` — Handle Resend webhook events
- `GET /domains` — List all domains
- `POST /domains/create` — Create a domain
- `GET /audiences/contacts` — List contacts in audience
- `POST /double-optin/subscribe` — Subscribe with confirmation
- `POST /double-optin/webhook` — Confirm subscription on click

## Test

```bash
curl -X POST http://localhost:8001/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Django!"}'
```
