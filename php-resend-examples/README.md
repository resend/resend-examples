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

### Prevent Gmail Threading
```bash
php src/send/prevent_threading.php
```

### With Attachments
```bash
php src/attachments/send.php
```

### With CID (Inline) Attachments
```bash
php src/attachments/send_cid.php
```

### Scheduled Sending
```bash
php src/scheduling/send.php
```

### Using Templates
```bash
php src/templates/send.php
```

### Audiences & Contacts
```bash
php src/audiences/contacts.php
```

### Domain Management
```bash
php src/domains/create.php
```

### Webhook Handler (Inbound)
```bash
php src/inbound/webhook.php
```

### Slim Web Application
```bash
# From the php-resend-examples directory
php -S localhost:8080 -t . src/slim_app.php

# Then in another terminal:
curl -X POST http://localhost:8080/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from PHP!"}'
```

## Quick Usage

```php
<?php
require 'vendor/autoload.php';

use Resend\Resend;

$resend = Resend::client('re_xxxxxxxxx');

$result = $resend->emails->send([
    'from' => 'Acme <onboarding@resend.dev>',
    'to' => ['delivered@resend.dev'],
    'subject' => 'Hello',
    'html' => '<p>Hello World</p>',
]);

echo "Email ID: " . $result->id;
```

## Project Structure

```
php-resend-examples/
├── src/
│   ├── send/
│   │   ├── basic.php           # Simple email sending
│   │   ├── batch.php           # Multiple emails at once
│   │   └── prevent_threading.php # Prevent Gmail threading
│   ├── attachments/
│   │   ├── send.php            # Emails with files
│   │   └── send_cid.php        # Inline images
│   ├── scheduling/
│   │   └── send.php            # Future delivery
│   ├── templates/
│   │   └── send.php            # Using Resend templates
│   ├── audiences/
│   │   └── contacts.php        # Manage contacts
│   ├── domains/
│   │   └── create.php          # Manage domains
│   ├── inbound/
│   │   └── webhook.php         # Handle webhooks
│   └── slim_app.php            # Slim web application
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
