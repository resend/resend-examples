# Next.js + Resend Examples (TypeScript)

A comprehensive collection of examples demonstrating how to send emails with [Resend](https://resend.com) using Next.js 15 and TypeScript.

## Features

This project includes examples for:

### Sending Emails
- **Basic Send** - Simple HTML email sending via API route
- **With Attachments** - Send emails with file attachments (URL or base64)
- **With CID Attachments** - Embed inline images using Content-ID
- **With Templates** - Use Resend's hosted templates with variables
- **With React Email** - Build emails with React components
- **Scheduled Sending** - Schedule emails for future delivery

### Forms & Server Actions
- **Contact Form** - Server Action with batch send (confirmation + notification)

### Receiving Emails
- **Inbound Emails** - Receive and forward emails via webhooks

### Management
- **Audiences** - Manage contacts and segments
- **Domains** - Create domains and view DNS records

### Advanced
- **Better Auth** - Authentication with email verification
- **Prevent Threading** - Stop Gmail from grouping emails

## Quick Start

### Prerequisites

- Node.js 22+ (LTS)
- pnpm (recommended) or npm
- A [Resend](https://resend.com) account

### Installation

```bash
# Clone the repository
git clone https://github.com/resend/resend-examples.git
cd resend-examples/nextjs-resend-examples/typescript

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Configuration

Edit `.env` with your Resend API key:

```env
# Required
RESEND_API_KEY=re_xxxxxxxxx

# Optional (for specific examples)
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
EMAIL_FROM=Acme <onboarding@yourdomain.com>
CONTACT_EMAIL=team@yourdomain.com
RESEND_AUDIENCE_ID=aud_xxxxxxxxx
```

Get your API key from [resend.com/api-keys](https://resend.com/api-keys).

### Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see all examples.

### Preview Email Templates

```bash
pnpm email:dev
```

This opens the React Email preview server to design and test your email templates.

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── send/             # Basic email sending
│   │   ├── send-attachment/  # With attachments
│   │   ├── send-cid/         # With CID attachments
│   │   ├── send-template/    # With templates
│   │   ├── send-scheduled/   # Scheduled emails
│   │   ├── webhook/          # Inbound webhook handler
│   │   ├── audiences/        # Contacts management
│   │   └── domains/          # Domain management
│   ├── contact-form/         # Server Action example
│   ├── send-email/           # Basic send UI
│   ├── attachments/          # Attachments UI
│   ├── cid-attachments/      # CID attachments UI
│   ├── templates/            # Templates UI
│   ├── react-email/          # React Email UI
│   ├── scheduling/           # Scheduling UI
│   ├── inbound/              # Inbound docs
│   ├── audiences/            # Audiences UI
│   ├── domains/              # Domains UI
│   ├── better-auth/          # Auth integration docs
│   └── prevent-threading/    # Threading prevention UI
├── components/               # Shared UI components
├── emails/                   # React Email templates
│   ├── welcome.tsx
│   ├── contact-confirmation.tsx
│   ├── contact-notification.tsx
│   ├── verification.tsx
│   └── password-reset.tsx
└── lib/
    └── resend.ts             # Resend client initialization
```

## Examples Deep Dive

### Basic Email Sending

The simplest way to send an email:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'Acme <onboarding@resend.dev>',
  to: ['delivered@resend.dev'],
  subject: 'Hello World',
  html: '<p>Hello from Resend!</p>',
});
```

### Contact Form with Server Actions

Using Next.js Server Actions with batch sending:

```typescript
"use server";

import { resend } from "@/lib/resend";

export async function submitContactForm(formData: FormData) {
  const { data, error } = await resend.batch.send([
    // Email to user
    {
      from: "Acme <onboarding@resend.dev>",
      to: [formData.get("email")],
      subject: "We received your message",
      react: ConfirmationEmail({ ... }),
    },
    // Email to team
    {
      from: "Acme <onboarding@resend.dev>",
      to: ["onboarding@resend.dev"],
      subject: "New contact form submission",
      react: NotificationEmail({ ... }),
    },
  ]);

  return { success: !error };
}
```

### React Email Templates

Build type-safe email templates:

```tsx
import { Html, Body, Container, Heading, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Body>
        <Container>
          <Heading>Welcome, {name}!</Heading>
          <Text>Thanks for signing up.</Text>
          <Button href="https://example.com">Get Started</Button>
        </Container>
      </Body>
    </Html>
  );
}
```

### Webhook Handling

Receive inbound emails:

```typescript
export async function POST(request: Request) {
  const payload = await request.text();

  // Always verify webhook signatures!
  const event = resend.webhooks.verify({
    payload,
    headers: { /* svix headers */ },
    secret: process.env.RESEND_WEBHOOK_SECRET,
  });

  if (event.type === 'email.received') {
    // Fetch full email content
    const { data: email } = await resend.emails.receiving.get(
      event.data.email_id
    );
    // Process the email...
  }

  return new Response('OK');
}
```

## Local Development with Webhooks

To test inbound emails locally, use ngrok:

```bash
# Start your dev server
pnpm dev

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL as your webhook endpoint
# https://abc123.ngrok.io/api/webhook
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Email**: Resend + React Email
- **Styling**: Tailwind CSS 4

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
