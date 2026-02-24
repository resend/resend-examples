<?php

namespace App\Controller;

use Resend;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class WebhookController
{
    private $resend;

    public function __construct()
    {
        $this->resend = Resend::client($_ENV['RESEND_API_KEY']);
    }

    public function handle(Request $request): JsonResponse
    {
        $svixId = $request->headers->get('svix-id');
        $svixTimestamp = $request->headers->get('svix-timestamp');
        $svixSignature = $request->headers->get('svix-signature');

        if (!$svixId || !$svixTimestamp || !$svixSignature) {
            return new JsonResponse(['error' => 'Missing webhook headers'], 400);
        }

        $webhookSecret = $_ENV['RESEND_WEBHOOK_SECRET'] ?? null;
        if (!$webhookSecret) {
            return new JsonResponse(['error' => 'Webhook secret not configured'], 500);
        }

        $payload = $request->getContent();

        try {
            // Verify webhook signature with Svix
            $wh = new \Svix\Webhook($webhookSecret);
            $event = $wh->verify($payload, [
                'svix-id' => $svixId,
                'svix-timestamp' => $svixTimestamp,
                'svix-signature' => $svixSignature,
            ]);

            $eventType = $event['type'] ?? '';
            error_log("Received webhook event: {$eventType}");

            switch ($eventType) {
                case 'email.received':
                    error_log("New email from: " . ($event['data']['from'] ?? ''));
                    break;
                case 'email.delivered':
                    error_log("Email delivered: " . ($event['data']['email_id'] ?? ''));
                    break;
                case 'email.bounced':
                    error_log("Email bounced: " . ($event['data']['email_id'] ?? ''));
                    break;
            }

            return new JsonResponse(['received' => true, 'type' => $eventType]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    public function doubleOptin(Request $request): JsonResponse
    {
        $webhookSecret = $_ENV['RESEND_WEBHOOK_SECRET'] ?? null;
        if (!$webhookSecret) {
            return new JsonResponse(['error' => 'Webhook secret not configured'], 500);
        }

        $payload = $request->getContent();

        try {
            $wh = new \Svix\Webhook($webhookSecret);
            $event = $wh->verify($payload, [
                'svix-id' => $request->headers->get('svix-id', ''),
                'svix-timestamp' => $request->headers->get('svix-timestamp', ''),
                'svix-signature' => $request->headers->get('svix-signature', ''),
            ]);

            $eventType = $event['type'] ?? '';

            if ($eventType !== 'email.clicked') {
                return new JsonResponse([
                    'received' => true,
                    'type' => $eventType,
                    'message' => 'Event type ignored',
                ]);
            }

            $audienceId = $_ENV['RESEND_AUDIENCE_ID'] ?? '';
            $recipientEmail = $event['data']['to'][0] ?? null;

            if (!$recipientEmail) {
                return new JsonResponse(['error' => 'No recipient in webhook data'], 400);
            }

            // Find contact by email
            $contacts = $this->resend->contacts->list($audienceId);
            $contact = null;

            foreach ($contacts->data as $c) {
                if ($c->email === $recipientEmail) {
                    $contact = $c;
                    break;
                }
            }

            if (!$contact) {
                return new JsonResponse(['error' => 'Contact not found'], 404);
            }

            // Update contact: confirm subscription
            $this->resend->contacts->update($audienceId, $contact->id, [
                'unsubscribed' => false,
            ]);

            return new JsonResponse([
                'received' => true,
                'type' => $eventType,
                'confirmed' => true,
                'email' => $recipientEmail,
                'contact_id' => $contact->id,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }
    }
}
