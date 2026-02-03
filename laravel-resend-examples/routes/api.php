<?php

use App\Http\Controllers\EmailController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Email sending endpoints using Resend.
|
*/

// Send welcome email using Laravel Mail facade
Route::post('/send/welcome', [EmailController::class, 'sendWelcome']);

// Send email directly using Resend facade
Route::post('/send/direct', [EmailController::class, 'sendDirect']);

// Send scheduled email
Route::post('/send/scheduled', [EmailController::class, 'sendScheduled']);

// Contact form submission (batch send)
Route::post('/contact', [EmailController::class, 'submitContactForm']);
