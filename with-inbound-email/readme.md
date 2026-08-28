# Resend with Inbound Email

This example shows how to receive emails using Resend's inbound email feature with webhooks.

## Features

- Receive `email.received` webhook events
- Verify webhook signatures for security
- Retrieve full email content (body + headers)
- Handle attachments
- Basic security filtering

## Prerequisites

- A Resend account with receiving enabled
- A domain configured for receiving (or use your `.resend.app` address)
- Node.js 18+

## How to run

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file:

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Expose your local server

For local development, use a tunnel to expose your webhook endpoint:

```bash
# Using ngrok
ngrok http 3000

# Using Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000
```

> **Note:** For persistent webhooks, use a static URL (ngrok paid plan or Cloudflare named tunnel). Ephemeral URLs require updating your webhook config after each restart.

### 5. Configure webhook in Resend

1. Go to [Resend Webhooks](https://resend.com/webhooks)
2. Click "Add Webhook"
3. Enter your endpoint URL: `https://<your-tunnel>/api/webhooks/email`
4. Select the `email.received` event
5. Click "Add"
6. Copy the signing secret to your `.env.local`

### 6. Send a test email

Send an email to your receiving address (check Dashboard → Emails → Receiving for your address).

The webhook will:
1. Verify the signature
2. Fetch the full email content
3. Log the email details
4. Return a success response

## Project structure

```
with-inbound-email/
├── src/
│   └── app/
│       └── api/
│           └── webhooks/
│               └── email/
│                   └── route.ts    # Webhook handler
├── package.json
├── tsconfig.json
└── readme.md
```

## Security considerations

This example includes basic security:

- **Webhook signature verification** — Prevents spoofed events
- **Sender filtering** — Example allowlist for trusted senders

For production, consider adding:

- Rate limiting per sender
- Content filtering for injection attacks
- Capability restrictions based on sender trust level

See the [agent-email-inbox skill](https://github.com/resend/resend-skills/tree/main/agent-email-inbox) for comprehensive security guidance.

## Learn more

- [Resend Receiving Docs](https://resend.com/docs/dashboard/receiving/introduction)
- [Webhook Verification](https://resend.com/docs/webhooks/verify-webhooks-requests)
- [Resend Node.js SDK](https://github.com/resend/resend-node)
