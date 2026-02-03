<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Resend\Laravel\Facades\Resend;

/**
 * Audience Controller
 *
 * Manages audiences (contact lists) and contacts using the Resend API.
 *
 * @see https://resend.com/docs/api-reference/audiences
 */
class AudienceController extends Controller
{
    /**
     * List all audiences
     */
    public function index()
    {
        $audiences = Resend::audiences()->list();

        return response()->json([
            'success' => true,
            'data' => $audiences->data,
        ]);
    }

    /**
     * Get a specific audience
     */
    public function show(string $id)
    {
        $audience = Resend::audiences()->get($id);

        return response()->json([
            'success' => true,
            'data' => $audience,
        ]);
    }

    /**
     * Create a new audience
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $audience = Resend::audiences()->create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'id' => $audience->id,
        ], 201);
    }

    /**
     * Delete an audience
     */
    public function destroy(string $id)
    {
        Resend::audiences()->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Audience deleted',
        ]);
    }

    /**
     * List contacts in an audience
     */
    public function contacts(string $audienceId)
    {
        $contacts = Resend::contacts()->list($audienceId);

        return response()->json([
            'success' => true,
            'data' => $contacts->data,
        ]);
    }

    /**
     * Add a contact to an audience
     */
    public function addContact(Request $request, string $audienceId)
    {
        $request->validate([
            'email' => 'required|email',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'unsubscribed' => 'nullable|boolean',
        ]);

        $contact = Resend::contacts()->create([
            'audience_id' => $audienceId,
            'email' => $request->email,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'unsubscribed' => $request->boolean('unsubscribed', false),
        ]);

        return response()->json([
            'success' => true,
            'id' => $contact->id,
        ], 201);
    }

    /**
     * Update a contact
     */
    public function updateContact(Request $request, string $audienceId, string $contactId)
    {
        $request->validate([
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'unsubscribed' => 'nullable|boolean',
        ]);

        $contact = Resend::contacts()->update([
            'audience_id' => $audienceId,
            'id' => $contactId,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'unsubscribed' => $request->boolean('unsubscribed'),
        ]);

        return response()->json([
            'success' => true,
            'id' => $contact->id,
        ]);
    }

    /**
     * Remove a contact from an audience
     */
    public function removeContact(string $audienceId, string $contactId)
    {
        Resend::contacts()->remove([
            'audience_id' => $audienceId,
            'id' => $contactId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contact removed',
        ]);
    }
}
