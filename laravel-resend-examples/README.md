# Laravel + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Laravel.

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

# Generate app key
php artisan key:generate

# Add your Resend API key to .env
```

## Configuration

The Resend package is configured in `config/resend.php`. Set these environment variables:

```env
MAIL_MAILER=resend
RESEND_API_KEY=re_xxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
MAIL_FROM_ADDRESS=onboarding@resend.dev
MAIL_FROM_NAME=Acme
```

## API Endpoints

### Email Sending

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send/welcome` | Send welcome email using Laravel Mail |
| POST | `/api/send/direct` | Send email directly via Resend |
| POST | `/api/send/scheduled` | Send scheduled email |
| POST | `/api/send/attachment` | Send email with attachment |
| POST | `/api/send/cid` | Send email with inline image |
| POST | `/api/send/template` | Send email using Resend template |
| POST | `/api/send/prevent-threading` | Send email without Gmail threading |
| POST | `/api/contact` | Contact form (batch send) |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook` | Handle Resend webhook events |

### Audiences & Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audiences` | List all audiences |
| POST | `/api/audiences` | Create audience |
| GET | `/api/audiences/{id}` | Get audience |
| DELETE | `/api/audiences/{id}` | Delete audience |
| GET | `/api/audiences/{id}/contacts` | List contacts |
| POST | `/api/audiences/{id}/contacts` | Add contact |
| PATCH | `/api/audiences/{id}/contacts/{contactId}` | Update contact |
| DELETE | `/api/audiences/{id}/contacts/{contactId}` | Remove contact |

### Domains

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/domains` | List all domains |
| POST | `/api/domains` | Create domain |
| GET | `/api/domains/{id}` | Get domain with DNS records |
| POST | `/api/domains/{id}/verify` | Verify domain |
| DELETE | `/api/domains/{id}` | Delete domain |

## Usage Examples

### Send Welcome Email
```bash
curl -X POST http://localhost:8000/api/send/welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev", "name": "John"}'
```

### Send Direct Email
```bash
curl -X POST http://localhost:8000/api/send/direct \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Laravel!"}'
```

### Send Scheduled Email
```bash
curl -X POST http://localhost:8000/api/send/scheduled \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev", "scheduled_at": "2024-12-25T10:00:00Z"}'
```

### Send with Inline Image
```bash
curl -X POST http://localhost:8000/api/send/cid \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev"}'
```

### Prevent Gmail Threading
```bash
curl -X POST http://localhost:8000/api/send/prevent-threading \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev", "subject": "Order Update", "message": "Your order shipped!"}'
```

### Artisan Command
```bash
php artisan email:send delivered@resend.dev "John Doe"
```

## Project Structure

```
laravel-resend-examples/
├── app/
│   ├── Console/Commands/
│   │   └── SendTestEmail.php
│   ├── Http/Controllers/
│   │   ├── EmailController.php
│   │   ├── WebhookController.php
│   │   ├── AudienceController.php
│   │   └── DomainController.php
│   └── Mail/
│       ├── WelcomeMail.php
│       └── ContactFormMail.php
├── config/
│   └── resend.php
├── resources/views/emails/
│   ├── welcome.blade.php
│   └── contact-form.blade.php
├── routes/
│   └── api.php
├── composer.json
├── .env.example
└── README.md
```

## Quick Code Examples

### Using Laravel Mail Facade
```php
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

Mail::to('user@example.com')
    ->send(new WelcomeMail('John'));
```

### Using Resend Facade Directly
```php
use Resend\Laravel\Facades\Resend;

$result = Resend::emails()->send([
    'from' => 'Acme <onboarding@resend.dev>',
    'to' => ['user@example.com'],
    'subject' => 'Hello',
    'html' => '<p>Hello World</p>',
]);

echo $result->id;
```

### Batch Sending
```php
use Resend\Laravel\Facades\Resend;

$result = Resend::batch()->send([
    [
        'from' => 'Acme <onboarding@resend.dev>',
        'to' => ['user1@example.com'],
        'subject' => 'Hello User 1',
        'html' => '<p>Hello!</p>',
    ],
    [
        'from' => 'Acme <onboarding@resend.dev>',
        'to' => ['user2@example.com'],
        'subject' => 'Hello User 2',
        'html' => '<p>Hello!</p>',
    ],
]);
```

## Resources

- [Resend Laravel Package](https://github.com/resend/resend-laravel)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
