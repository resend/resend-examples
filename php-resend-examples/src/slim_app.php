<?php

/**
 * Slim Framework Application with Resend
 *
 * A minimal web application demonstrating Resend integration
 * with PHP's Slim framework.
 *
 * Usage:
 *   php -S localhost:8080 src/slim_app.php
 *
 * Endpoints:
 *   POST /send    - Send an email
 *   POST /webhook - Handle webhook events
 *   GET  /health  - Health check
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Resend\Resend;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

$resend = Resend::client($_ENV['RESEND_API_KEY']);

/**
 * Send an email
 */
$app->post('/send', function (Request $request, Response $response) use ($resend) {
    $body = $request->getParsedBody();

    $to = $body['to'] ?? null;
    $subject = $body['subject'] ?? null;
    $message = $body['message'] ?? null;

    if (!$to || !$subject || !$message) {
        $response->getBody()->write(json_encode([
            'error' => 'Missing required fields: to, subject, message'
        ]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    try {
        $result = $resend->emails->send([
            'from' => $_ENV['EMAIL_FROM'] ?? 'Acme <onboarding@resend.dev>',
            'to' => [$to],
            'subject' => $subject,
            'html' => "<p>{$message}</p>",
        ]);

        $response->getBody()->write(json_encode([
            'success' => true,
            'id' => $result->id,
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => $e->getMessage()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Handle webhook events
 */
$app->post('/webhook', function (Request $request, Response $response) use ($resend) {
    $payload = (string) $request->getBody();

    $svixId = $request->getHeaderLine('svix-id');
    $svixTimestamp = $request->getHeaderLine('svix-timestamp');
    $svixSignature = $request->getHeaderLine('svix-signature');

    if (!$svixId || !$svixTimestamp || !$svixSignature) {
        $response->getBody()->write(json_encode([
            'error' => 'Missing webhook headers'
        ]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $webhookSecret = $_ENV['RESEND_WEBHOOK_SECRET'] ?? null;
    if (!$webhookSecret) {
        $response->getBody()->write(json_encode([
            'error' => 'Webhook secret not configured'
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    try {
        $event = $resend->webhooks->verify([
            'payload' => $payload,
            'headers' => [
                'svix-id' => $svixId,
                'svix-timestamp' => $svixTimestamp,
                'svix-signature' => $svixSignature,
            ],
            'secret' => $webhookSecret,
        ]);

        $eventType = $event['type'];
        error_log("Received webhook event: {$eventType}");

        switch ($eventType) {
            case 'email.received':
                error_log("New email from: " . $event['data']['from']);
                break;
            case 'email.delivered':
                error_log("Email delivered: " . $event['data']['email_id']);
                break;
            case 'email.bounced':
                error_log("Email bounced: " . $event['data']['email_id']);
                break;
        }

        $response->getBody()->write(json_encode([
            'received' => true,
            'type' => $eventType,
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response->getBody()->write(json_encode([
            'error' => $e->getMessage()
        ]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Health check
 */
$app->get('/health', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['status' => 'ok']));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
