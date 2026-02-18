# RedwoodJS + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using RedwoodJS.

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

## Development

### TypeScript
```bash
cd typescript
npm run dev
```

### JavaScript
```bash
cd javascript
npm run dev
```

## API Endpoints

RedwoodJS uses serverless functions at `/.redwood/functions/`:

- `POST /api/send` — Send an email
- `POST /api/sendAttachment` — Send with file attachment
- `POST /api/sendCid` — Send with inline CID image
- `POST /api/sendScheduled` — Schedule an email
- `POST /api/sendTemplate` — Send with template
- `POST /api/webhook` — Handle Resend webhook events
- `GET/POST /api/domains` — List/create domains
- `GET /api/audiencesContacts` — List audience contacts
- `POST /api/doubleOptinSubscribe` — Subscribe with confirmation
- `POST /api/doubleOptinWebhook` — Confirm subscription on click

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
redwoodjs-resend-examples/
├── typescript/
│   ├── api/
│   │   └── src/
│   │       ├── functions/              # Serverless API functions
│   │       └── lib/resend.ts           # Resend client
│   ├── web/
│   │   └── src/
│   │       ├── pages/                  # Page components
│   │       ├── layouts/                # Layout components
│   │       ├── components/             # Shared components
│   │       └── Routes.tsx              # RedwoodJS router
│   ├── redwood.toml
│   └── package.json
├── javascript/
│   ├── api/
│   │   └── src/
│   │       ├── functions/              # Serverless API functions
│   │       └── lib/resend.js           # Resend client
│   ├── web/
│   │   └── src/
│   │       ├── pages/                  # Page components
│   │       ├── layouts/                # Layout components
│   │       ├── components/             # Shared components
│   │       └── Routes.jsx              # RedwoodJS router
│   ├── redwood.toml
│   └── package.json
├── .env.example
└── README.md
```

## Resources

- [Resend Node.js SDK](https://github.com/resend/resend-node)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)
- [RedwoodJS Documentation](https://redwoodjs.com/docs)

## License

MIT
