<?php

namespace App\Controller;

use Resend;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class EmailController
{
    private $resend;

    public function __construct()
    {
        $this->resend = Resend::client($_ENV['RESEND_API_KEY']);
    }

    public function send(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        $to = $body['to'] ?? null;
        $subject = $body['subject'] ?? null;
        $message = $body['message'] ?? null;

        if (!$to || !$subject || !$message) {
            return new JsonResponse(
                ['error' => 'Missing required fields: to, subject, message'],
                400
            );
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';

        try {
            $result = $this->resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => $subject,
                'html' => "<p>{$message}</p>",
            ]);

            return new JsonResponse(['success' => true, 'id' => $result->id]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function sendPreventThreading(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        $to = $body['to'] ?? null;
        $subject = $body['subject'] ?? 'Your Daily Report';
        $message = $body['message'] ?? 'This email will not be threaded in Gmail.';

        if (!$to) {
            return new JsonResponse(['error' => 'Missing required field: to'], 400);
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';

        try {
            $result = $this->resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => $subject,
                'html' => "<p>{$message}</p>",
                'headers' => [
                    'X-Entity-Ref-ID' => bin2hex(random_bytes(16)),
                ],
            ]);

            return new JsonResponse([
                'success' => true,
                'id' => $result->id,
                'prevented_threading' => true,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function sendBatch(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        $to = $body['to'] ?? null;
        $contactEmail = $body['contactEmail'] ?? 'delivered@resend.dev';

        if (!$to) {
            return new JsonResponse(['error' => 'Missing required field: to'], 400);
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';

        try {
            $result = $this->resend->batch->send([
                [
                    'from' => $from,
                    'to' => [$to],
                    'subject' => 'We received your message',
                    'html' => '<h1>Thanks for reaching out!</h1><p>We\'ll get back to you soon.</p>',
                ],
                [
                    'from' => $from,
                    'to' => [$contactEmail],
                    'subject' => 'New contact form submission',
                    'html' => '<h1>New message received</h1><p>From: ' . htmlspecialchars($to) . '</p>',
                ],
            ]);

            return new JsonResponse([
                'success' => true,
                'ids' => array_map(fn($email) => $email->id, $result->data ?? []),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function sendAttachment(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);
        $to = $body['to'] ?? null;

        if (!$to) {
            return new JsonResponse(['error' => 'Missing required field: to'], 400);
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';
        $fileContent = "Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: " . date('c') . "\n";

        try {
            $result = $this->resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => 'Email with Attachment - Resend Example',
                'html' => '<h1>Your attachment is ready</h1><p>Please find the sample file attached.</p>',
                'attachments' => [
                    [
                        'filename' => 'sample.txt',
                        'content' => base64_encode($fileContent),
                    ],
                ],
            ]);

            return new JsonResponse(['success' => true, 'id' => $result->id]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function sendCid(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);
        $to = $body['to'] ?? null;

        if (!$to) {
            return new JsonResponse(['error' => 'Missing required field: to'], 400);
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';
        $placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        try {
            $result = $this->resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => 'Email with Inline Image - Resend Example',
                'html' => '<div style="text-align:center;padding:20px;"><img src="cid:logo" alt="Logo" width="100" height="100" /><h1>Inline Image Example</h1><p>The image above is embedded using CID.</p></div>',
                'attachments' => [
                    [
                        'filename' => 'logo.png',
                        'content' => $placeholderImage,
                        'content_id' => 'logo',
                    ],
                ],
            ]);

            return new JsonResponse(['success' => true, 'id' => $result->id]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function sendScheduled(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);
        $to = $body['to'] ?? null;
        $subject = $body['subject'] ?? null;
        $message = $body['message'] ?? null;
        $scheduledAt = $body['scheduledAt'] ?? null;

        if (!$to || !$subject || !$message || !$scheduledAt) {
            return new JsonResponse(
                ['error' => 'Missing required fields: to, subject, message, scheduledAt'],
                400
            );
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';

        try {
            $result = $this->resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => $subject,
                'html' => "<p>{$message}</p>",
                'scheduled_at' => $scheduledAt,
            ]);

            return new JsonResponse([
                'success' => true,
                'id' => $result->id,
                'scheduledFor' => $scheduledAt,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function sendTemplate(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);
        $to = $body['to'] ?? null;
        $templateId = $body['templateId'] ?? null;
        $variables = $body['variables'] ?? [];

        if (!$to || !$templateId) {
            return new JsonResponse(
                ['error' => 'Missing required fields: to, templateId'],
                400
            );
        }

        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';

        try {
            $result = $this->resend->emails->send([
                'from' => $from,
                'to' => [$to],
                'subject' => 'Email from Template',
                'template' => [
                    'id' => $templateId,
                    'variables' => $variables,
                ],
            ]);

            return new JsonResponse(['success' => true, 'id' => $result->id]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function listDomains(): JsonResponse
    {
        try {
            $result = $this->resend->domains->list();
            return new JsonResponse(['domains' => $result->data ?? []]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function createDomain(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);
        $name = $body['name'] ?? null;

        if (!$name) {
            return new JsonResponse(['error' => 'Domain name is required'], 400);
        }

        try {
            $result = $this->resend->domains->create(['name' => $name]);
            return new JsonResponse([
                'success' => true,
                'domain' => [
                    'id' => $result->id,
                    'name' => $result->name,
                    'status' => $result->status,
                    'records' => $result->records ?? [],
                ],
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function listContacts(): JsonResponse
    {
        $audienceId = $_ENV['RESEND_AUDIENCE_ID'] ?? null;

        if (!$audienceId) {
            return new JsonResponse(
                ['error' => 'RESEND_AUDIENCE_ID not configured', 'contacts' => []],
                400
            );
        }

        try {
            $result = $this->resend->contacts->list($audienceId);
            $contacts = $result->data ?? [];
            return new JsonResponse(['contacts' => $contacts, 'total' => count($contacts)]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    public function doubleOptinSubscribe(Request $request): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        $email = $body['email'] ?? null;
        $name = $body['name'] ?? '';

        if (!$email) {
            return new JsonResponse(['error' => 'Missing required field: email'], 400);
        }

        $audienceId = $_ENV['RESEND_AUDIENCE_ID'] ?? null;
        if (!$audienceId) {
            return new JsonResponse(['error' => 'RESEND_AUDIENCE_ID not configured'], 500);
        }

        $confirmUrl = $_ENV['CONFIRM_REDIRECT_URL'] ?? 'https://example.com/confirmed';
        $from = $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>';

        try {
            // Create contact with unsubscribed=true
            $contact = $this->resend->contacts->create($audienceId, [
                'email' => $email,
                'first_name' => $name,
                'unsubscribed' => true,
            ]);

            // Send confirmation email
            $greeting = $name ? "Welcome, {$name}!" : 'Welcome!';
            $html = <<<HTML
<div style="text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;">
  <h1>{$greeting}</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href="{$confirmUrl}" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
</div>
HTML;

            $sent = $this->resend->emails->send([
                'from' => $from,
                'to' => [$email],
                'subject' => 'Confirm your subscription',
                'html' => $html,
            ]);

            return new JsonResponse([
                'success' => true,
                'message' => 'Confirmation email sent',
                'contact_id' => $contact->id,
                'email_id' => $sent->id,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
