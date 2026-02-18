# Bun + Resend Examples

Examples of sending emails and managing contacts with [Resend](https://resend.com) using [Bun](https://bun.sh).

## Prerequisites

- [Bun](https://bun.sh) installed
- A [Resend API key](https://resend.com/api-keys)

## Setup

1. Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
# TypeScript
cd typescript && bun install

# JavaScript
cd javascript && bun install
```

## Standalone Examples

Each example file in `examples/` can be run directly:

```bash
# TypeScript
cd typescript
bun run examples/basic-send.ts
bun run examples/batch-send.ts
bun run examples/with-attachments.ts
bun run examples/with-cid-attachments.ts
bun run examples/scheduled-send.ts
bun run examples/with-template.ts
bun run examples/prevent-threading.ts
bun run examples/audiences.ts
bun run examples/domains.ts
bun run examples/inbound.ts
bun run examples/double-optin-subscribe.ts user@example.com "Jane Doe"
bun run examples/double-optin-webhook.ts

# JavaScript
cd javascript
bun run examples/basic-send.js
bun run examples/batch-send.js
bun run examples/with-attachments.js
bun run examples/with-cid-attachments.js
bun run examples/scheduled-send.js
bun run examples/with-template.js
bun run examples/prevent-threading.js
bun run examples/audiences.js
bun run examples/domains.js
bun run examples/inbound.js
bun run examples/double-optin-subscribe.js user@example.com "Jane Doe"
bun run examples/double-optin-webhook.js
```

## Web Server

Start the Bun.serve() web server:

```bash
# TypeScript
cd typescript && bun run dev

# JavaScript
cd javascript && bun run dev
```

### API Endpoints

| Method | Path                       | Description                        |
| ------ | -------------------------- | ---------------------------------- |
| GET    | `/health`                  | Health check                       |
| POST   | `/send`                    | Send an email                      |
| POST   | `/webhook`                 | Handle Resend webhook events       |
| POST   | `/double-optin/subscribe`  | Start double opt-in subscription   |
| POST   | `/double-optin/webhook`    | Handle double opt-in confirmation  |

### Example Requests

```bash
# Health check
curl http://localhost:3000/health

# Send an email
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello!", "message": "Hello from Bun!"}'

# Subscribe (double opt-in)
curl -X POST http://localhost:3000/double-optin/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Jane Doe"}'
```
