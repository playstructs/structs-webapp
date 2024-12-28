<?php

namespace App\Security;

use App\Dto\ApiResponseContentDto;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class PlayerAuthenticator extends AbstractAuthenticator
{
    public EntityManagerInterface $entityManager;


    public function __construct(
        EntityManagerInterface $entityManager
    ) {
        $this->entityManager = $entityManager;
    }

    /**
     * Called on every request to decide if this authenticator should be
     * used for the request. Returning `false` will cause this authenticator
     * to be skipped.
     */
    public function supports(Request $request): ?bool
    {
        return str_starts_with($request->getRequestUri(), '/api/');
    }

    public function authenticate(Request $request): Passport
    {
        $session = $request->getSession();
        $playerId = $session->get('player_id');

        if ($playerId === null) {
            throw new CustomUserMessageAuthenticationException('Login required');
        }

        return new SelfValidatingPassport(new UserBadge($playerId));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // on success, let the request continue
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $content = new ApiResponseContentDto();
        $content->errors = ['authentication_error' => 'Login required'];

        return new JsonResponse($content, Response::HTTP_UNAUTHORIZED);
    }
}