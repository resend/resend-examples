# SvelteKit + Resend Examples

This project demonstrates how to send emails using [Resend](https://resend.com) with [SvelteKit](https://kit.svelte.dev).

Both TypeScript and JavaScript variants are included.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A [Resend API key](https://resend.com/api-keys)

### Setup

1. Navigate to the variant you want to use:

```bash
# TypeScript
cd typescript

# JavaScript
cd javascript
```

2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your values:

```bash
cp ../.env.example .env
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Examples

| Example | Description |
| --- | --- |
| Send Email | Basic email sending |
| Attachments | Send email with file attachments |
| CID Attachments | Embed images using Content-ID |
| Scheduling | Schedule emails for later delivery |
| Templates | Send using Resend templates |
| Prevent Threading | Prevent email client threading |
| Audiences | Manage contacts and audiences |
| Domains | List and manage domains |
| Double Opt-in | Subscription with confirmation |
| Inbound | Receive and process inbound emails |

## Project Structure

```
src/
  lib/
    server/
      resend.ts      # Resend client initialization
    components/
      PageHeader.svelte
      ResultDisplay.svelte
  routes/
    +layout.svelte    # Navigation layout
    +page.svelte      # Home page
    api/              # API route handlers
      send/           # Send email endpoint
      send-attachment/ # Attachment endpoint
      ...
    send-email/       # Send email page
    attachments/      # Attachments page
    ...
```

## License

MIT
