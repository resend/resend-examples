<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;

/**
 * Double Opt-In Controller
 *
 * Implements GDPR-compliant double opt-in subscription flow:
 * 1. User submits email → contact created with unsubscribed: true
 * 2. Confirmation email sent with trackable link
 * 3. User clicks link → webhook fires → contact confirmed
 *
 * @see https://resend.com/docs/api-reference/contacts/create-contact
 */
class DoubleOptinController extends Controller
{
    /**
     * Subscribe with double opt-in
     *
     * Creates a contact with unsubscribed: true and sends confirmation email.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
        ]);

        $audienceId = config('resend.audience_id');
        if (!$audienceId) {
            return response()->json([
                'error' => 'RESEND_AUDIENCE_ID not configured',
            ], 500);
        }

        $confirmUrl = config('resend.confirm_redirect_url', 'https://example.com/confirmed');

        try {
            // Step 1: Create contact with unsubscribed: true (pending confirmation)
            $contact = Resend::contacts()->create([
                'audience_id' => $audienceId,
                'email' => $request->email,
                'first_name' => $request->name,
                'unsubscribed' => true, // Will be set to false when they confirm
            ]);

            // Step 2: Send confirmation email with trackable link
            $welcomeText = $request->name
                ? "Welcome, {$request->name}!"
                : "Welcome!";

            $email = Resend::emails()->send([
                'from' => config('mail.from.address'),
                'to' => [$request->email],
                'subject' => 'Confirm your subscription',
                'html' => view('emails.double-optin-confirm', [
                    'welcomeText' => $welcomeText,
                    'confirmUrl' => $confirmUrl,
                ])->render(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Confirmation email sent. Please check your inbox.',
                'contact_id' => $contact->id,
                'email_id' => $email->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Double opt-in subscribe failed', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle double opt-in confirmation webhook
     *
     * Processes email.clicked events to confirm subscriptions.
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

            // Only process email.clicked events
            if ($event['type'] !== 'email.clicked') {
                return response()->json([
                    'received' => true,
                    'type' => $event['type'],
                    'message' => 'Event ignored',
                ]);
            }

            $audienceId = config('resend.audience_id');
            if (!$audienceId) {
                return response()->json([
                    'error' => 'RESEND_AUDIENCE_ID not configured',
                ], 500);
            }

            // Get recipient email from webhook data
            $recipientEmail = $event['data']['to'][0] ?? null;
            if (!$recipientEmail) {
                return response()->json([
                    'error' => 'No recipient email in webhook data',
                ], 400);
            }

            Log::info("Confirmation click received for: {$recipientEmail}");

            // Find contact by email
            $contacts = Resend::contacts()->list($audienceId);
            $contact = collect($contacts->data)->firstWhere('email', $recipientEmail);

            if (!$contact) {
                return response()->json([
                    'error' => 'Contact not found',
                ], 404);
            }

            // Update contact to confirmed (unsubscribed: false)
            Resend::contacts()->update($audienceId, $contact->id, [
                'unsubscribed' => false,
            ]);

            Log::info("Contact confirmed: {$recipientEmail} ({$contact->id})");

            return response()->json([
                'received' => true,
                'type' => $event['type'],
                'confirmed' => true,
                'email' => $recipientEmail,
                'contact_id' => $contact->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Double opt-in webhook failed', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
