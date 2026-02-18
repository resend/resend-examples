<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;

/**
 * Inbound Email Controller
 *
 * Demonstrates receiving and processing inbound emails using Resend's
 * inbound email feature and webhooks.
 *
 * Key concepts:
 * - Webhooks notify you when emails arrive (email.received event)
 * - Webhook payloads contain metadata only, not the email body
 * - Use Resend::emails()->get() to fetch the full content
 * - Forward emails by combining receive + send
 *
 * Setup:
 * 1. Configure your domain with MX records pointing to Resend
 *    (or use your auto-assigned @yourname.resend.app address)
 * 2. Create a webhook for email.received in the Resend dashboard
 * 3. Use ngrok to expose your local server for testing
 *
 * @see https://resend.com/docs/receive-emails
 */
class InboundController extends Controller
{
    /**
     * Handle inbound email webhook
     *
     * Receives email.received events, fetches full email content,
     * and optionally forwards the email to a team address.
     */
    public function webhook(Request $request)
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
            // Verify webhook signature
            $event = Resend::webhooks()->verify([
                'payload' => $payload,
                'headers' => [
                    'svix-id' => $svixId,
                    'svix-timestamp' => $svixTimestamp,
                    'svix-signature' => $svixSignature,
                ],
                'secret' => $webhookSecret,
            ]);

            // Only process email.received events
            if ($event['type'] !== 'email.received') {
                return response()->json([
                    'received' => true,
                    'type' => $event['type'],
                    'message' => 'Event ignored',
                ]);
            }

            $data = $event['data'];
            $emailId = $data['email_id'];

            Log::info("Inbound email received", [
                'from' => $data['from'],
                'to' => $data['to'],
                'subject' => $data['subject'],
                'email_id' => $emailId,
            ]);

            // Webhook payloads contain metadata only — fetch the full email content
            $email = Resend::emails()->get($emailId);

            Log::info("Fetched full email content", [
                'subject' => $email->subject,
                'has_html' => !empty($email->html),
                'has_text' => !empty($email->text),
            ]);

            // Forward the inbound email to the team
            $forwardTo = config('app.contact_email', 'delivered@resend.dev');

            $forwarded = Resend::emails()->send([
                'from' => config('mail.from.address'),
                'to' => [$forwardTo],
                'subject' => "Fwd: {$email->subject}",
                'html' => view('emails.inbound-forwarded', [
                    'originalFrom' => $data['from'],
                    'originalTo' => implode(', ', $data['to'] ?? []),
                    'originalSubject' => $email->subject,
                    'originalDate' => $email->created_at,
                    'body' => $email->html ?? $email->text ?? '(no content)',
                ])->render(),
            ]);

            Log::info("Inbound email forwarded", [
                'forwarded_to' => $forwardTo,
                'forwarded_id' => $forwarded->id,
            ]);

            return response()->json([
                'received' => true,
                'type' => $event['type'],
                'email_id' => $emailId,
                'forwarded' => true,
                'forwarded_id' => $forwarded->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Inbound webhook failed', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Fetch a specific inbound email by ID
     *
     * Useful for retrieving the full content of a previously received email.
     */
    public function show(string $emailId)
    {
        try {
            $email = Resend::emails()->get($emailId);

            return response()->json([
                'id' => $email->id,
                'from' => $email->from,
                'to' => $email->to,
                'subject' => $email->subject,
                'created_at' => $email->created_at,
                'has_html' => !empty($email->html),
                'has_text' => !empty($email->text),
                'text_preview' => $email->text
                    ? mb_substr($email->text, 0, 200) . (mb_strlen($email->text) > 200 ? '...' : '')
                    : null,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch inbound email', [
                'email_id' => $emailId,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
