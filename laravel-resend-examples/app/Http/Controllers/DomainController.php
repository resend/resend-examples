<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Resend\Laravel\Facades\Resend;

/**
 * Domain Controller
 *
 * Manages sending domains using the Resend API.
 *
 * @see https://resend.com/docs/api-reference/domains
 */
class DomainController extends Controller
{
    /**
     * List all domains
     */
    public function index()
    {
        $domains = Resend::domains()->list();

        return response()->json([
            'success' => true,
            'data' => $domains->data,
        ]);
    }

    /**
     * Get a specific domain with DNS records
     */
    public function show(string $id)
    {
        $domain = Resend::domains()->get($id);

        return response()->json([
            'success' => true,
            'data' => $domain,
        ]);
    }

    /**
     * Create a new domain
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'region' => 'nullable|string|in:us-east-1,eu-west-1,sa-east-1',
        ]);

        $domain = Resend::domains()->create([
            'name' => $request->name,
            'region' => $request->input('region', 'us-east-1'),
        ]);

        return response()->json([
            'success' => true,
            'id' => $domain->id,
            'records' => $domain->records,
            'message' => 'Add these DNS records to verify your domain',
        ], 201);
    }

    /**
     * Verify a domain
     */
    public function verify(string $id)
    {
        $result = Resend::domains()->verify($id);

        return response()->json([
            'success' => true,
            'status' => $result->status ?? 'verification_started',
        ]);
    }

    /**
     * Delete a domain
     */
    public function destroy(string $id)
    {
        Resend::domains()->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Domain deleted',
        ]);
    }
}
