<?php

namespace App\Controller;

use App\Factory\PlayerPendingFactory;
use App\Manager\AuthManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    #[Route('/api/auth/signup', name: 'api_signup', methods: ['POST'])]
    public function signup(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): Response
    {
        $authManager = new AuthManager($validator, $entityManager, new PlayerPendingFactory());
        return $authManager->signup($request);
    }
}
