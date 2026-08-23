# Hono + Resend Examples

Examples of sending emails using [Resend](https://resend.com) with [Hono](https://hono.dev).

## Setup

```bash
cp .env.example .env
# Edit .env with your Resend API key and configuration
```

## TypeScript

```bash
cd typescript
npm install

# Run the Hono server
npm run dev

# Run standalone examples
npx tsx examples/basic-send.ts
npx tsx examples/batch-send.ts
npx tsx examples/with-attachments.ts
npx tsx examples/with-cid-attachments.ts
npx tsx examples/scheduled-send.ts
npx tsx examples/with-template.ts
npx tsx examples/prevent-threading.ts
npx tsx examples/audiences.ts
npx tsx examples/domains.ts
npx tsx examples/inbound.ts
npx tsx examples/double-optin-subscribe.ts user@example.com "Jane Doe"
npx tsx examples/double-optin-webhook.ts
```

## JavaScript

```bash
cd javascript
npm install

# Run the Hono server
npm run dev

# Run standalone examples
node examples/basic-send.js
node examples/batch-send.js
node examples/with-attachments.js
node examples/with-cid-attachments.js
node examples/scheduled-send.js
node examples/with-template.js
node examples/prevent-threading.js
node examples/audiences.js
node examples/domains.js
node examples/inbound.js
node examples/double-optin-subscribe.js user@example.com "Jane Doe"
node examples/double-optin-webhook.js
```

## API Endpoints

Once the server is running:

- `GET /health` - Health check
- `POST /send` - Send an email (`{ "to": "...", "subject": "...", "message": "..." }`)
- `POST /webhook` - Receive Resend webhook events
- `POST /double-optin/subscribe` - Start double opt-in (`{ "email": "...", "name": "..." }`)
- `POST /double-optin/webhook` - Handle double opt-in confirmation

## Contributing

See something that could be improved? We welcome contributions! [Open an issue](https://github.com/resend/resend-examples/issues) to report a bug or suggest an improvement, or [submit a pull request](https://github.com/resend/resend-examples/pulls) with your changes.
