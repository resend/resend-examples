# Express + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Express (Node.js).

## Prerequisites

- Node.js 22+
- A [Resend](https://resend.com) account

## Installation

```bash
# Choose your variant
cd typescript  # or javascript

# Install dependencies
npm install

# Copy environment variables
cp ../.env.example .env

# Add your Resend API key to .env
```

## Standalone Examples

### TypeScript
```bash
cd typescript
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
npx tsx examples/double-optin-subscribe.ts user@example.com "John Doe"
npx tsx examples/double-optin-webhook.ts
```

### JavaScript
```bash
cd javascript
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
node examples/double-optin-subscribe.js user@example.com "John Doe"
node examples/double-optin-webhook.js
```

## Express Application

### TypeScript
```bash
cd typescript
npm run dev

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Express!"}'
```

### JavaScript
```bash
cd javascript
npm run dev

# Same curl commands work
```

## API Endpoints

- `GET /health` — Health check
- `POST /send` — Send an email
- `POST /webhook` — Handle Resend webhook events
- `POST /double-optin/subscribe` — Subscribe with confirmation
- `POST /double-optin/webhook` — Confirm subscription on click

## Quick Usage

```typescript
import { Resend } from "resend";

const resend = new Resend("re_xxxxxxxxx");

const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Hello",
  html: "<p>Hello World</p>",
});

console.log("Email ID:", data?.id);
```

## Project Structure

```
express-resend-examples/
├── typescript/
│   ├── examples/                    # 12 standalone examples
│   ├── src/index.ts                 # Express app
│   ├── package.json
│   └── tsconfig.json
├── javascript/
│   ├── examples/                    # 12 standalone examples
│   ├── src/index.js                 # Express app
│   └── package.json
├── .env.example
└── README.md
```

## Resources

- [Resend Node.js SDK](https://github.com/resend/resend-node)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## Contributing

See something that could be improved? We welcome contributions! [Open an issue](https://github.com/resend/resend-examples/issues) to report a bug or suggest an improvement, or [submit a pull request](https://github.com/resend/resend-examples/pulls) with your changes.

## License

MIT
