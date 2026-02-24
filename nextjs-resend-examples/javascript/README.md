# Next.js + Resend Examples (JavaScript)

A comprehensive collection of examples demonstrating how to send emails with [Resend](https://resend.com) using Next.js 16 and JavaScript.

## Features

This project includes examples for:

### Sending Emails
- **Basic Send** - Simple HTML email sending via API route
- **With Attachments** - Send emails with file attachments
- **With CID Attachments** - Embed inline images
- **With Templates** - Use Resend's hosted templates
- **With React Email** - Build emails with React components
- **Scheduled Sending** - Schedule emails for future delivery

### Forms & Server Actions
- **Contact Form** - Server Action with batch send

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
cd resend-examples/nextjs-resend-examples/javascript

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Configuration

Edit `.env` with your Resend API key:

```env
RESEND_API_KEY=re_xxxxxxxxx
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

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes
│   ├── contact-form/         # Server Action example
│   ├── send-email/           # Basic send UI
│   └── ...                   # Other examples
├── components/               # Shared UI components
├── emails/                   # React Email templates
└── lib/
    └── resend.js             # Resend client
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (with JSDoc)
- **Email**: Resend + React Email
- **Styling**: Tailwind CSS 4

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

See something that could be improved? We welcome contributions! [Open an issue](https://github.com/resend/resend-examples/issues) to report a bug or suggest an improvement, or [submit a pull request](https://github.com/resend/resend-examples/pulls) with your changes.

## License

MIT
