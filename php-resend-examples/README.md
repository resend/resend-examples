# PHP + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using PHP.

## Prerequisites

- PHP 8.2+
- Composer
- A [Resend](https://resend.com) account

## Installation

```bash
# Install dependencies
composer install

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
php src/send/basic.php
```

### Batch Sending
```bash
php src/send/batch.php
```

### With Attachments
```bash
php src/attachments/send.php
```

### Scheduled Sending
```bash
php src/scheduling/send.php
```

### Using Templates
```bash
# First create a template in Resend dashboard, then:
php src/templates/send.php
```

### Domain Management
```bash
php src/domains/create.php notifications.example.com
```

### Contacts Management
```bash
php src/audiences/contacts.php
```

### Webhook Handler
Deploy `src/inbound/webhook.php` to a public URL and register it in the Resend dashboard.

For local development:
```bash
# Terminal 1: Start PHP server
php -S localhost:8000 -t src/inbound

# Terminal 2: Expose with ngrok
ngrok http 8000

# Register the ngrok URL as your webhook endpoint
```

## Project Structure

```
php-resend-examples/
├── src/
│   ├── send/
│   │   ├── basic.php       # Simple email sending
│   │   └── batch.php       # Multiple emails at once
│   ├── attachments/
│   │   └── send.php        # Emails with files
│   ├── templates/
│   │   └── send.php        # Using Resend templates
│   ├── scheduling/
│   │   └── send.php        # Future delivery
│   ├── domains/
│   │   └── create.php      # Domain management
│   ├── audiences/
│   │   └── contacts.php    # Contact management
│   └── inbound/
│       └── webhook.php     # Receive emails
├── composer.json
├── .env.example
└── README.md
```

## Resources

- [Resend PHP SDK](https://github.com/resend/resend-php)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
