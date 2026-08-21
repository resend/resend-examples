<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Resend\Laravel\Facades\Resend;

/**
 * API Key Controller
 *
 * Manages API keys using the Resend API.
 *
 * @see https://resend.com/docs/api-reference/api-keys
 */
class ApiKeyController extends Controller
{
    /**
     * List all API keys
     */
    public function index()
    {
        $apiKeys = Resend::apiKeys()->list();

        return response()->json([
            'success' => true,
            'data' => $apiKeys->data,
        ]);
    }

    /**
     * Create a new API key
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permission' => 'nullable|string|in:full_access,sending_access',
            'domain_id' => 'nullable|string',
        ]);

        $apiKey = Resend::apiKeys()->create($request->only(['name', 'permission', 'domain_id']));

        return response()->json([
            'success' => true,
            'id' => $apiKey->id,
            'token' => $apiKey->token,
            'message' => 'Store this token securely, it will not be shown again',
        ], 201);
    }

    /**
     * Rename an API key
     *
     * Only the name can be changed here. Permission and domain scope are
     * fixed at creation time so a leaked key cannot widen its own access.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $apiKey = Resend::apiKeys()->update($id, [
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'data' => $apiKey,
        ]);
    }

    /**
     * Delete an API key
     */
    public function destroy(string $id)
    {
        Resend::apiKeys()->remove($id);

        return response()->json([
            'success' => true,
            'message' => 'API key deleted',
        ]);
    }
}
