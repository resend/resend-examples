# Spring Boot + Resend Example

## Setup

```bash
cd spring_boot_app

# Set environment variables
export RESEND_API_KEY=re_xxxxxxxxx
export EMAIL_FROM="Acme <onboarding@resend.dev>"
export RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx

# Build and run
mvn spring-boot:run
```

## Endpoints

- `POST /send` — Send an email
- `POST /webhook` — Handle Resend webhook events
- `GET /health` — Health check

## Test

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Spring Boot!"}'
```
