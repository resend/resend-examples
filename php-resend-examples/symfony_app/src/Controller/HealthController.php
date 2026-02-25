<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;

class HealthController
{
    public function index(): JsonResponse
    {
        return new JsonResponse(['status' => 'ok']);
    }
}
