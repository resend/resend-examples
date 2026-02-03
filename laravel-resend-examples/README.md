# Laravel + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Laravel 11.

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

The Resend Laravel package automatically registers itself. Configure it in `.env`:

```env
MAIL_MAILER=resend
RESEND_API_KEY=re_xxxxxxxxx
```

## Examples

### Using Laravel Mail Facade (Recommended)

```php
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

// Send a Mailable
Mail::to('delivered@resend.dev')
    ->send(new WelcomeMail('John Doe'));

// Queue for async sending
Mail::to('delivered@resend.dev')
    ->queue(new WelcomeMail('John Doe'));
```

### Using Resend Facade Directly

```php
use Resend\Laravel\Facades\Resend;

// Basic send
$result = Resend::emails()->send([
    'from' => 'Acme <onboarding@resend.dev>',
    'to' => ['delivered@resend.dev'],
    'subject' => 'Hello',
    'html' => '<p>Hello World</p>',
]);

// Scheduled send
$result = Resend::emails()->send([
    'from' => 'Acme <onboarding@resend.dev>',
    'to' => ['delivered@resend.dev'],
    'subject' => 'Reminder',
    'html' => '<p>This is your reminder!</p>',
    'scheduled_at' => '2026-02-03T10:00:00Z',
]);

// Batch send
$result = Resend::batch()->send([
    ['from' => '...', 'to' => ['delivered+1@resend.dev'], ...],
    ['from' => '...', 'to' => ['delivered+2@resend.dev'], ...],
]);
```

### Artisan Commands

```bash
# Send a test email
php artisan email:send-test delivered@resend.dev

# Use direct Resend method
php artisan email:send-test delivered@resend.dev --method=direct
```

### API Endpoints

```bash
# Start the server
php artisan serve

# Send welcome email
curl -X POST http://localhost:8000/api/send/welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev", "name": "John"}'

# Send direct email
curl -X POST http://localhost:8000/api/send/direct \
  -H "Content-Type: application/json" \
  -d '{"email": "delivered@resend.dev", "subject": "Hello", "message": "Hi there!"}'

# Submit contact form (batch)
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "delivered@resend.dev", "message": "Hello!"}'
```

## Project Structure

```
laravel-resend-examples/
├── app/
│   ├── Console/Commands/
│   │   └── SendTestEmail.php     # Artisan command
│   ├── Http/Controllers/
│   │   └── EmailController.php   # API endpoints
│   └── Mail/
│       ├── WelcomeMail.php       # Welcome mailable
│       └── ContactFormMail.php   # Contact notification
├── config/
│   └── resend.php                # Resend config
├── resources/views/emails/
│   ├── welcome.blade.php         # Welcome template
│   └── contact-form.blade.php    # Contact template
├── routes/
│   └── api.php                   # API routes
├── composer.json
└── README.md
```

## Resources

- [Resend Laravel Package](https://github.com/resend/resend-laravel)
- [Laravel Mail Documentation](https://laravel.com/docs/mail)
- [Resend Documentation](https://resend.com/docs)

## License

MIT
