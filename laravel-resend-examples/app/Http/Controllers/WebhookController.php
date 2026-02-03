<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;

/**
 * Webhook Controller
 *
 * Handles incoming webhook events from Resend including:
 * - email.received: New inbound email arrived
 * - email.delivered: Email was delivered successfully
 * - email.bounced: Email bounced
 * - email.complained: Recipient marked as spam
 *
 * IMPORTANT: Always verify webhook signatures to prevent spoofed events!
 *
 * @see https://resend.com/docs/dashboard/webhooks/introduction
 */
class WebhookController extends Controller
{
    /**
     * Handle incoming webhook from Resend
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();

        $svixId = $request->header('svix-id');
        $svixTimestamp = $request->header('svix-timestamp');
        $svixSignature = $request->header('svix-signature');

        if (!$svixId || !$svixTimestamp || !$svixSignature) {
            return response()->json([
                'error' => 'Missing webhook headers',
            ], 400);
        }

        $webhookSecret = config('resend.webhook_secret');
        if (!$webhookSecret) {
            Log::error('RESEND_WEBHOOK_SECRET not configured');
            return response()->json([
                'error' => 'Webhook secret not configured',
            ], 500);
        }

        try {
            $event = Resend::webhooks()->verify([
                'payload' => $payload,
                'headers' => [
                    'svix-id' => $svixId,
                    'svix-timestamp' => $svixTimestamp,
                    'svix-signature' => $svixSignature,
                ],
                'secret' => $webhookSecret,
            ]);

            $eventType = $event['type'];
            Log::info("Received webhook event: {$eventType}", ['data' => $event['data']]);

            switch ($eventType) {
                case 'email.received':
                    $this->handleEmailReceived($event['data']);
                    break;

                case 'email.delivered':
                    Log::info("Email delivered: {$event['data']['email_id']}");
                    break;

                case 'email.bounced':
                    Log::warning("Email bounced: {$event['data']['email_id']}");
                    // Remove from mailing list, alert user, etc.
                    break;

                case 'email.complained':
                    Log::warning("Spam complaint: {$event['data']['email_id']}");
                    // Unsubscribe user immediately
                    break;

                case 'email.opened':
                    Log::info("Email opened: {$event['data']['email_id']}");
                    break;

                case 'email.clicked':
                    Log::info("Link clicked: {$event['data']['email_id']}");
                    break;
            }

            return response()->json([
                'received' => true,
                'type' => $eventType,
            ]);
        } catch (\Exception $e) {
            Log::error('Webhook verification failed', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Invalid webhook signature',
            ], 400);
        }
    }

    /**
     * Handle inbound email received event
     */
    protected function handleEmailReceived(array $data): void
    {
        Log::info("New email from: {$data['from']}", [
            'to' => $data['to'],
            'subject' => $data['subject'],
        ]);

        // Fetch full email content if needed
        // $email = Resend::emails()->get($data['email_id']);
    }
}
