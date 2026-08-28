<?php

use App\Http\Controllers\DomainController;
use App\Http\Controllers\DoubleOptinController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\InboundController;
use App\Http\Controllers\SegmentController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Email sending endpoints using Resend.
|
*/

// Email sending
Route::prefix('send')->group(function () {
    // Send welcome email using Laravel Mail facade
    Route::post('/welcome', [EmailController::class, 'sendWelcome']);

    // Send email directly using Resend facade
    Route::post('/direct', [EmailController::class, 'sendDirect']);

    // Send scheduled email
    Route::post('/scheduled', [EmailController::class, 'sendScheduled']);

    // Send email with attachment
    Route::post('/attachment', [EmailController::class, 'sendWithAttachment']);

    // Send email with CID (inline) attachment
    Route::post('/cid', [EmailController::class, 'sendWithCidAttachment']);

    // Send email using Resend template
    Route::post('/template', [EmailController::class, 'sendWithTemplate']);

    // Send email that won't be threaded in Gmail
    Route::post('/prevent-threading', [EmailController::class, 'sendPreventThreading']);

    // Send batch emails (up to 100)
    Route::post('/batch', [EmailController::class, 'sendBatch']);
});

// Contact form submission (batch send)
Route::post('/contact', [EmailController::class, 'submitContactForm']);

// Webhook handler
Route::post('/webhook', [WebhookController::class, 'handle']);

// Segments & Contacts
Route::prefix('segments')->group(function () {
    Route::get('/', [SegmentController::class, 'index']);
    Route::post('/', [SegmentController::class, 'store']);
    Route::get('/{id}', [SegmentController::class, 'show']);
    Route::delete('/{id}', [SegmentController::class, 'destroy']);

    // Contacts within a segment
    Route::get('/{segmentId}/contacts', [SegmentController::class, 'contacts']);
    Route::post('/{segmentId}/contacts', [SegmentController::class, 'addContact']);

    // Update/remove address the contact directly — no segment scoping needed
    Route::patch('/contacts/{contactId}', [SegmentController::class, 'updateContact']);
    Route::delete('/contacts/{contactId}', [SegmentController::class, 'removeContact']);
});

// Domains
Route::prefix('domains')->group(function () {
    Route::get('/', [DomainController::class, 'index']);
    Route::post('/', [DomainController::class, 'store']);
    Route::get('/{id}', [DomainController::class, 'show']);
    Route::post('/{id}/verify', [DomainController::class, 'verify']);
    Route::delete('/{id}', [DomainController::class, 'destroy']);
});

// Inbound emails
Route::prefix('inbound')->group(function () {
    Route::post('/webhook', [InboundController::class, 'webhook']);
    Route::get('/{emailId}', [InboundController::class, 'show']);
});

// Double Opt-In
Route::prefix('double-optin')->group(function () {
    Route::post('/subscribe', [DoubleOptinController::class, 'subscribe']);
    Route::post('/webhook', [DoubleOptinController::class, 'webhook']);
});
