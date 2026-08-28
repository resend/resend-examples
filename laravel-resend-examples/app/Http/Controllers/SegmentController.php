<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Resend\Laravel\Facades\Resend;

/**
 * Segment Controller
 *
 * Manages segments (contact lists) and contacts using the Resend API.
 *
 * @see https://resend.com/docs/api-reference/segments
 */
class SegmentController extends Controller
{
    /**
     * List all segments
     */
    public function index()
    {
        $segments = Resend::segments()->list();

        return response()->json([
            'success' => true,
            'data' => $segments->data,
        ]);
    }

    /**
     * Get a specific segment
     */
    public function show(string $id)
    {
        $segment = Resend::segments()->get($id);

        return response()->json([
            'success' => true,
            'data' => $segment,
        ]);
    }

    /**
     * Create a new segment
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $segment = Resend::segments()->create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'id' => $segment->id,
        ], 201);
    }

    /**
     * Delete a segment
     */
    public function destroy(string $id)
    {
        Resend::segments()->remove($id);

        return response()->json([
            'success' => true,
            'message' => 'Segment deleted',
        ]);
    }

    /**
     * List contacts in a segment
     */
    public function contacts(string $segmentId)
    {
        $contacts = Resend::contacts()->list([
            'segment_id' => $segmentId,
        ]);

        return response()->json([
            'success' => true,
            'data' => $contacts->data,
        ]);
    }

    /**
     * Add a contact to a segment
     */
    public function addContact(Request $request, string $segmentId)
    {
        $request->validate([
            'email' => 'required|email',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'unsubscribed' => 'nullable|boolean',
        ]);

        $contact = Resend::contacts()->create([
            'email' => $request->email,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'unsubscribed' => $request->boolean('unsubscribed', false),
            'segments' => [
                ['id' => $segmentId],
            ],
        ]);

        return response()->json([
            'success' => true,
            'id' => $contact->id,
        ], 201);
    }

    /**
     * Update a contact
     */
    public function updateContact(Request $request, string $contactId)
    {
        $request->validate([
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'unsubscribed' => 'nullable|boolean',
        ]);

        $contact = Resend::contacts()->update($contactId, [
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
     * Remove a contact
     */
    public function removeContact(string $contactId)
    {
        Resend::contacts()->remove($contactId);

        return response()->json([
            'success' => true,
            'message' => 'Contact removed',
        ]);
    }
}
