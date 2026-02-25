<?php

namespace App\Console\Commands;

use App\Mail\WelcomeMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Resend\Laravel\Facades\Resend;

/**
 * Send Test Email Command
 *
 * Artisan command to send test emails from the command line.
 *
 * Usage:
 *   php artisan email:send-test delivered@resend.dev
 *   php artisan email:send-test delivered@resend.dev --method=direct
 */
class SendTestEmail extends Command
{
    protected $signature = 'email:send-test
                            {email : The recipient email address}
                            {--method=mail : Sending method (mail or direct)}';

    protected $description = 'Send a test email to verify Resend integration';

    public function handle(): int
    {
        $email = $this->argument('email');
        $method = $this->option('method');

        $this->info("Sending test email to {$email} using {$method} method...");

        try {
            if ($method === 'direct') {
                // Send directly using Resend facade
                $result = Resend::emails()->send([
                    'from' => config('mail.from.address'),
                    'to' => [$email],
                    'subject' => 'Test Email from Laravel',
                    'html' => '<h1>Hello!</h1><p>This is a test email sent directly via Resend.</p>',
                ]);

                $this->info("Email sent! ID: {$result->id}");
            } else {
                // Send using Laravel Mail facade
                Mail::to($email)->send(new WelcomeMail('Test User'));
                $this->info('Email sent via Laravel Mail facade!');
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to send email: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
