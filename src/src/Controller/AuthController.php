<?php

namespace App\Controller;

use App\Dto\ApiResponseContentDto;
use App\Factory\PlayerPendingFactory;
use App\Manager\AuthManager;
use App\Manager\SignatureValidationManager;
use App\Oidc\LoginContinuePolicy;
use App\Security\BearerTokenManager;
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
     * @param LoginContinuePolicy $loginContinuePolicy
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
        Security $security,
        LoginContinuePolicy $loginContinuePolicy
    ): Response {
        $authManager = new AuthManager(
            $validator,
            $entityManager,
            new SignatureValidationManager($client),
            $loginContinuePolicy
        );
        return $authManager->login($request, $security);
    }

    /**
     * Token login (REQ-AUTH-1): the body is the same signed request as /api/auth/login; the answer is
     * a bearer token for the Authorization header instead of a session cookie.
     *
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    #[Route('/api/auth/token', name: 'api_token', methods: ['POST'])]
    public function token(
        Request $request,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        HttpClientInterface $client,
        BearerTokenManager $tokens
    ): Response {
        $authManager = new AuthManager(
            $validator,
            $entityManager,
            new SignatureValidationManager($client)
        );
        return $authManager->token($request, $tokens);
    }

    /**
     * Ends the session, and revokes the bearer token if the request carries one.
     */
    #[Route('/api/auth/logout', name: 'api_logout', methods: ['GET'])]
    public function logout(
        Security $security,
        Request $request,
        BearerTokenManager $tokens
    ): Response
    {
        $responseContent = new ApiResponseContentDto();
        $responseContent->success = true;

        $bearer = BearerTokenManager::fromHeader($request->headers->get('Authorization'));
        if ($bearer !== null) {
            $tokens->revoke($bearer);
        }

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

    /**
     * @param string $code
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @param HttpClientInterface $client
     * @return Response
     * @throws \Doctrine\DBAL\Exception
     */
    #[Route(
        '/api/auth/activation-code/{code}',
        name: 'api_get_activation_code_info',
        methods: ['GET']
    )]
    public function getActivationCodeInfo(
        string $code,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        HttpClientInterface $client
    ): Response {
        $authManager = new AuthManager(
            $validator,
            $entityManager,
            new SignatureValidationManager($client)
        );
        return $authManager->getActivationCodeInfo($code);
    }
}
