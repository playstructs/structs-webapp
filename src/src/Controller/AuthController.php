<?php

namespace App\Controller;

use App\Dto\ApiResponseContentDto;
use App\Factory\PlayerPendingFactory;
use App\Manager\AuthManager;
use App\Manager\SignatureValidationManager;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AuthController extends AbstractController
{
    /**
     * @param Request $request
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $entityManager
     * @param HttpClientInterface $client
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    #[Route('/api/auth/signup', name: 'api_signup', methods: ['POST'])]
    public function signup(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        HttpClientInterface $client
    ): Response {
        $authManager = new AuthManager(
            $validator,
            $entityManager,
            new SignatureValidationManager($client)
        );
        return $authManager->signup($request, new PlayerPendingFactory());
    }

    /**
     * @param Request $request
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $entityManager
     * @param HttpClientInterface $client
     * @param Security $security
     * @return Response
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    #[Route('/api/auth/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        HttpClientInterface $client,
        Security $security
    ): Response {
        $authManager = new AuthManager(
            $validator,
            $entityManager,
            new SignatureValidationManager($client)
        );
        return $authManager->login($request, $security);
    }

    /**
     * @param Security $security
     * @return Response
     */
    #[Route('/api/auth/logout', name: 'api_logout', methods: ['GET'])]
    public function logout(
        Security $security
    ): Response
    {
        $responseContent = new ApiResponseContentDto();
        $responseContent->success = true;

        try {
            $security->logout(false);
        } catch (Exception $e) {
            $responseContent->errors[] = $e->getMessage();
        }

        return new JsonResponse(
            $responseContent,
            Response::HTTP_OK
        );
    }
}
