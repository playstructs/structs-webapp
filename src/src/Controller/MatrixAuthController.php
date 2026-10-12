<?php

namespace App\Controller;

use App\Manager\MatrixAuthManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Sits under /api/auth/ so it shares that firewall: no session is required,
 * the signed body is the credential.
 */
class MatrixAuthController extends AbstractController
{
    #[Route('/api/auth/matrix', name: 'api_auth_matrix', methods: ['POST'])]
    public function signIn(Request $request, MatrixAuthManager $matrixAuthManager): JsonResponse
    {
        return $matrixAuthManager->signIn($request);
    }
}
