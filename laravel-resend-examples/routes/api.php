<?php

use App\Http\Controllers\AudienceController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\EmailController;
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
});

// Contact form submission (batch send)
Route::post('/contact', [EmailController::class, 'submitContactForm']);

// Webhook handler
Route::post('/webhook', [WebhookController::class, 'handle']);

// Audiences & Contacts
Route::prefix('audiences')->group(function () {
    Route::get('/', [AudienceController::class, 'index']);
    Route::post('/', [AudienceController::class, 'store']);
    Route::get('/{id}', [AudienceController::class, 'show']);
    Route::delete('/{id}', [AudienceController::class, 'destroy']);

    // Contacts within an audience
    Route::get('/{audienceId}/contacts', [AudienceController::class, 'contacts']);
    Route::post('/{audienceId}/contacts', [AudienceController::class, 'addContact']);
    Route::patch('/{audienceId}/contacts/{contactId}', [AudienceController::class, 'updateContact']);
    Route::delete('/{audienceId}/contacts/{contactId}', [AudienceController::class, 'removeContact']);
});

// Domains
Route::prefix('domains')->group(function () {
    Route::get('/', [DomainController::class, 'index']);
    Route::post('/', [DomainController::class, 'store']);
    Route::get('/{id}', [DomainController::class, 'show']);
    Route::post('/{id}/verify', [DomainController::class, 'verify']);
    Route::delete('/{id}', [DomainController::class, 'destroy']);
});
