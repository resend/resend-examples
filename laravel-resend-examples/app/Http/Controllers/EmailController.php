<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeMail;
use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Resend\Laravel\Facades\Resend;

/**
 * Email Controller
 *
 * Demonstrates different ways to send emails with Resend in Laravel:
 * 1. Using Laravel's Mail facade with Resend driver
 * 2. Using Resend facade directly for more control
 */
class EmailController extends Controller
{
    /**
     * Send a basic email using Laravel's Mail facade
     *
     * This is the recommended approach for most use cases.
     * It uses Laravel's built-in mail system with Resend as the driver.
     */
    public function sendWelcome(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        // Send using Laravel's Mail facade
        // Resend is configured as the mail driver in config/mail.php
        Mail::to($request->email)
            ->send(new WelcomeMail($request->name));

        return response()->json([
            'success' => true,
            'message' => 'Welcome email sent!',
        ]);
    }

    /**
     * Send email directly using Resend facade
     *
     * Use this approach when you need more control over the API,
     * such as accessing the email ID, using templates, or scheduling.
     */
    public function sendDirect(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        // Send directly using Resend facade
        $result = Resend::emails()->send([
            'from' => config('mail.from.address'),
            'to' => [$request->email],
            'subject' => $request->subject,
            'html' => "<p>{$request->message}</p>",
        ]);

        return response()->json([
            'success' => true,
            'id' => $result->id,
        ]);
    }

    /**
     * Send a scheduled email
     */
    public function sendScheduled(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'scheduled_at' => 'required|date|after:now',
        ]);

        $result = Resend::emails()->send([
            'from' => config('mail.from.address'),
            'to' => [$request->email],
            'subject' => 'Scheduled Email',
            'html' => '<p>This email was scheduled!</p>',
            'scheduled_at' => $request->scheduled_at,
        ]);

        return response()->json([
            'success' => true,
            'id' => $result->id,
            'scheduled_at' => $request->scheduled_at,
        ]);
    }

    /**
     * Send contact form emails (batch)
     */
    public function submitContactForm(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);

        $submittedAt = now()->format('F j, Y \a\t g:i A');

        // Send batch: confirmation to user + notification to team
        $result = Resend::batch()->send([
            // Confirmation to user
            [
                'from' => config('mail.from.address'),
                'to' => [$request->email],
                'subject' => 'We received your message',
                'html' => view('emails.contact-confirmation', [
                    'name' => $request->name,
                ])->render(),
            ],
            // Notification to team
            [
                'from' => config('mail.from.address'),
                'to' => [config('app.contact_email', 'delivered@resend.dev')],
                'subject' => "New message from {$request->name}",
                'html' => view('emails.contact-form', [
                    'senderName' => $request->name,
                    'senderEmail' => $request->email,
                    'message' => $request->message,
                    'submittedAt' => $submittedAt,
                ])->render(),
            ],
        ]);

        return response()->json([
            'success' => true,
            'ids' => collect($result->data)->pluck('id'),
        ]);
    }

    /**
     * Send email with attachment
     */
    public function sendWithAttachment(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'attachment' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('attachment');
        $content = base64_encode(file_get_contents($file->getRealPath()));

        $result = Resend::emails()->send([
            'from' => config('mail.from.address'),
            'to' => [$request->email],
            'subject' => 'Email with Attachment',
            'html' => '<p>Please find the attached file.</p>',
            'attachments' => [
                [
                    'filename' => $file->getClientOriginalName(),
                    'content' => $content,
                ],
            ],
        ]);

        return response()->json([
            'success' => true,
            'id' => $result->id,
        ]);
    }

    /**
     * Send email with CID (inline) attachment
     */
    public function sendWithCidAttachment(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Placeholder image (in real app, load from storage)
        $placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

        $result = Resend::emails()->send([
            'from' => config('mail.from.address'),
            'to' => [$request->email],
            'subject' => 'Email with Inline Image - Laravel Example',
            'html' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; padding: 20px; background: #f5f5f5;">
                        <img src="cid:logo" alt="Company Logo" width="100" height="100" />
                    </div>
                    <div style="padding: 20px;">
                        <h1 style="color: #333;">Inline Image Example</h1>
                        <p style="color: #666;">
                            The image above is embedded using a <strong>Content-ID (CID)</strong> reference.
                        </p>
                    </div>
                </div>
            ',
            'attachments' => [
                [
                    'filename' => 'logo.png',
                    'content' => $placeholderImage,
                    'content_id' => 'logo',
                ],
            ],
        ]);

        return response()->json([
            'success' => true,
            'id' => $result->id,
        ]);
    }

    /**
     * Send email using a Resend template
     */
    public function sendWithTemplate(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'template_id' => 'required|string',
        ]);

        $result = Resend::emails()->send([
            'from' => config('mail.from.address'),
            'to' => [$request->email],
            'subject' => 'Email from Template',
            'template' => [
                'id' => $request->template_id,
                // Variables must match EXACTLY (case-sensitive!)
                'variables' => [
                    'name' => $request->input('name', 'User'),
                    'company' => $request->input('company', 'Acme Inc'),
                ],
            ],
        ]);

        return response()->json([
            'success' => true,
            'id' => $result->id,
        ]);
    }

    /**
     * Send email that won't be threaded in Gmail
     */
    public function sendPreventThreading(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        $result = Resend::emails()->send([
            'from' => config('mail.from.address'),
            'to' => [$request->email],
            'subject' => $request->subject,
            'html' => "<p>{$request->message}</p>",
            'headers' => [
                // Unique ID prevents Gmail from threading
                'X-Entity-Ref-ID' => (string) \Illuminate\Support\Str::uuid(),
            ],
        ]);

        return response()->json([
            'success' => true,
            'id' => $result->id,
            'prevented_threading' => true,
        ]);
    }
}
