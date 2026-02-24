# Astro + Resend Examples

Full-stack examples of sending emails using [Resend](https://resend.com) with [Astro](https://astro.build).

Each variant is a complete Astro application with server API routes and Astro pages.

## Setup

```bash
cp .env.example .env
# Edit .env with your Resend API key and configuration
```

## TypeScript

```bash
cd typescript
npm install
npm run dev
```

## JavaScript

```bash
cd javascript
npm install
npm run dev
```

## Pages

Once the dev server is running, visit `http://localhost:4321`:

- `/` - Home with links to all examples
- `/send-email` - Send a basic email
- `/attachments` - Send email with attachments
- `/cid-attachments` - Send email with inline CID images
- `/scheduling` - Schedule an email for later delivery
- `/templates` - Send email using a template
- `/prevent-threading` - Send emails that avoid Gmail threading
- `/audiences` - Manage audiences and contacts
- `/domains` - Manage domains
- `/double-optin` - Double opt-in subscription flow
- `/inbound` - Inbound email information

## API Endpoints

- `POST /api/send` - Send an email
- `POST /api/send-attachment` - Send email with attachment
- `POST /api/send-cid` - Send email with CID inline image
- `POST /api/send-scheduled` - Schedule an email
- `POST /api/send-template` - Send email using a template
- `POST /api/webhook` - Receive Resend webhook events
- `GET /api/domains` - List domains
- `POST /api/domains` - Create a domain
- `GET /api/audiences/contacts` - List contacts in an audience

## Contributing

See something that could be improved? We welcome contributions! [Open an issue](https://github.com/resend/resend-examples/issues) to report a bug or suggest an improvement, or [submit a pull request](https://github.com/resend/resend-examples/pulls) with your changes.
