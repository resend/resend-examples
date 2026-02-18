# Remix + Resend Examples

Examples of sending emails using [Resend](https://resend.com) with [Remix](https://remix.run).

This is a full-stack Remix app with both API routes and UI pages.

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

Once the dev server is running, visit `http://localhost:5173`:

- `/` - Home page with links to all examples
- `/send-email` - Send a basic email
- `/attachments` - Send email with attachments
- `/cid-attachments` - Send email with inline CID images
- `/scheduling` - Schedule an email for later
- `/templates` - Send email using a template
- `/prevent-threading` - Send emails that bypass Gmail threading
- `/audiences` - Manage audiences and contacts
- `/domains` - Manage domains
- `/double-optin` - Double opt-in subscription flow
- `/inbound` - Inbound email instructions

## API Routes

- `POST /api/send` - Send an email (`{ "to": "...", "subject": "...", "message": "..." }`)
- `POST /api/send-attachment` - Send email with attachment
- `POST /api/send-cid` - Send email with CID inline image
- `POST /api/send-scheduled` - Send a scheduled email
- `POST /api/send-template` - Send email using a template
- `POST /api/webhook` - Receive Resend webhook events
- `GET /api/domains` - List domains
- `POST /api/domains` - Create a domain
- `GET /api/audiences/contacts` - List contacts
