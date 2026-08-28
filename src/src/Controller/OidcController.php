<?php

namespace App\Controller;

use App\Manager\OidcAuthorizationRequestManager;
use App\Manager\OidcClaimsManager;
use App\Oidc\AuthorizationServerFactory;
use App\Oidc\Entity\ClientEntity;
use App\Oidc\Entity\UserEntity;
use App\Oidc\Repository\ClientRepository;
use App\Oidc\JwksBuilder;
use App\Oidc\OidcConfig;
use App\Oidc\Repository\AuthCodeRepository;
use League\OAuth2\Server\Exception\OAuthServerException;
use League\OAuth2\Server\RequestTypes\AuthorizationRequestInterface;
use Nyholm\Psr7\Factory\Psr17Factory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Symfony\Bridge\PsrHttpMessage\Factory\HttpFoundationFactory;
use Symfony\Bridge\PsrHttpMessage\Factory\PsrHttpFactory;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Throwable;

/**
 * OpenID Connect provider used by Matrix Authentication Service.
 *
 * Identity still comes from the Cosmos signature login on /api/auth/login. This
 * controller only converts an existing webapp session into a standard
 * authorization code flow; it never sees a signature or a key.
 *
 * These routes sit outside /api/ on purpose. PlayerAuthenticator answers with
 * JSON 401, which is the wrong reply for a browser redirect arriving from MAS.
 */
class OidcController extends AbstractController
{
    /**
     * Where an unauthenticated authorize request sends the browser. The SPA
     * reads this parameter at boot and calls /oauth/resume once a session
     * exists.
     */
    private const string SPA_CONTINUE_PARAMETER = 'oidc';

    public function __construct(
        private readonly OidcConfig $config,
        private readonly AuthorizationServerFactory $serverFactory,
        private readonly OidcClaimsManager $claimsManager,
        private readonly OidcAuthorizationRequestManager $authorizationRequestManager,
        private readonly AuthCodeRepository $authCodeRepository,
        private readonly ClientRepository $clientRepository,
        private readonly JwksBuilder $jwksBuilder
    ) {
    }

    #[Route('/.well-known/openid-configuration', name: 'oidc_discovery', methods: ['GET'])]
    public function discovery(): Response
    {
        $this->assertEnabled();

        return new JsonResponse([
            'issuer'                                => $this->config->getIssuer(),
            'authorization_endpoint'                => $this->config->url('/oauth/authorize'),
            'token_endpoint'                        => $this->config->url('/oauth/token'),
            'jwks_uri'                              => $this->config->url('/oauth/jwks'),
            'userinfo_endpoint'                     => $this->config->url('/oauth/userinfo'),
            'response_types_supported'              => ['code'],
            'subject_types_supported'               => ['public'],
            'id_token_signing_alg_values_supported' => ['RS256'],
            'scopes_supported'                      => $this->config->getSupportedScopes(),
            'claims_supported'                      => [
                'iss',
                'sub',
                'aud',
                'exp',
                'iat',
                'nonce',
                'preferred_username',
                'name',
                'picture',
                'guild_id',
                'primary_address',
            ],
            'token_endpoint_auth_methods_supported' => ['client_secret_post', 'client_secret_basic'],
            'grant_types_supported'                 => ['authorization_code'],
            'code_challenge_methods_supported'      => ['S256'],
        ]);
    }

    #[Route('/oauth/jwks', name: 'oidc_jwks', methods: ['GET'])]
    public function jwks(): Response
    {
        $this->assertEnabled();

        return new JsonResponse($this->jwksBuilder->build());
    }

    /**
     * Entry point for a Matrix login.
     *
     * With a webapp session this returns an authorization code immediately. The
     * player already proved key ownership when the session was created, so no
     * second signature is asked for.
     */
    #[Route('/oauth/authorize', name: 'oidc_authorize', methods: ['GET'])]
    public function authorize(Request $request): Response
    {
        $this->assertEnabled();

        return $this->issueCodeOrRedirectToLogin($request, $request->query->all(), null);
    }

    /**
     * Completes an authorization request that was parked while the player
     * logged in. The SPA navigates here after a successful login.
     */
    #[Route('/oauth/resume', name: 'oidc_resume', methods: ['GET'])]
    public function resume(Request $request): Response
    {
        $this->assertEnabled();

        $requestId = (string) $request->query->get('request_id', '');

        if ($requestId === '') {
            return $this->redirect('/');
        }

        $parameters = $this->authorizationRequestManager->findPendingParameters($requestId);

        if ($parameters === null) {
            // Expired, already used, or never existed. There is no redirect URI
            // we can trust, so the browser goes back to the game rather than
            // anywhere an attacker chose.
            return $this->redirect('/');
        }

        if ($this->sessionPlayerId($request) === null) {
            // The SPA only sends the browser here after a successful login, so
            // an absent session means the cookie did not survive the round trip
            // rather than that the player needs to try again.
            return $this->loginNotEstablishedResponse();
        }

        return $this->issueCodeOrRedirectToLogin($request, $parameters, $requestId);
    }

    /**
     * Server-to-server exchange with MAS. No browser session is involved; the
     * client authenticates with its secret.
     */
    #[Route('/oauth/token', name: 'oidc_token', methods: ['POST'])]
    public function token(Request $request): Response
    {
        $this->assertEnabled();

        $psrRequest = $this->psrRequest($request);
        $psrResponse = $this->psrResponse();

        try {
            return $this->toSymfony(
                $this->serverFactory->createAuthorizationServer()->respondToAccessTokenRequest($psrRequest, $psrResponse)
            );
        } catch (OAuthServerException $exception) {
            return $this->toSymfony($exception->generateHttpResponse($psrResponse));
        } catch (Throwable $exception) {
            return $this->toSymfony(
                OAuthServerException::serverError($exception->getMessage(), $exception)
                    ->generateHttpResponse($psrResponse)
            );
        }
    }

    #[Route('/oauth/userinfo', name: 'oidc_userinfo', methods: ['GET', 'POST'])]
    public function userinfo(Request $request): Response
    {
        $this->assertEnabled();

        $psrResponse = $this->psrResponse();

        try {
            $validated = $this->serverFactory->createResourceServer()
                ->validateAuthenticatedRequest($this->psrRequest($request));
        } catch (OAuthServerException $exception) {
            return $this->toSymfony($exception->generateHttpResponse($psrResponse));
        }

        $playerId = $validated->getAttribute('oauth_user_id');
        $clientId = $validated->getAttribute('oauth_client_id');
        $client = is_string($clientId) ? $this->clientRepository->getClientEntity($clientId) : null;

        // Re-checked rather than trusted from the token: an address revoked or a
        // guild left after the token was issued must stop resolving identity
        // before the token's own hour is up.
        $player = is_string($playerId) && $client instanceof ClientEntity
            ? $this->claimsManager->findEligiblePlayer($playerId, $client->getGuildId())
            : null;

        if ($player === null) {
            return $this->toSymfony(
                OAuthServerException::accessDenied('Player is no longer approved for this guild')
                    ->generateHttpResponse($psrResponse)
            );
        }

        return new JsonResponse(
            $this->claimsManager->buildClaims($player, $this->scopesFrom($validated))
        );
    }

    /**
     * The one place an authorization code is issued.
     *
     * Both the direct authorize request and the post-login resume run through
     * here, and both re-validate the parameters from scratch. Nothing that was
     * parked during the login detour is trusted on the way back.
     *
     * @param array<string, mixed> $queryParameters
     */
    private function issueCodeOrRedirectToLogin(
        Request $request,
        array $queryParameters,
        ?string $pendingRequestId
    ): Response {
        $psrRequest = $this->psrRequest($request)->withQueryParams($queryParameters);
        $psrResponse = $this->psrResponse();
        $server = $this->serverFactory->createAuthorizationServer();

        try {
            $authRequest = $server->validateAuthorizationRequest($psrRequest);
            $this->assertPkce($authRequest);

            $playerId = $this->sessionPlayerId($request);

            if ($playerId === null) {
                return $this->redirectToLogin($queryParameters);
            }

            $guildId = $this->guildIdFor($authRequest);

            // The session records which guild the player signed in to. On a
            // webapp serving several guilds it can disagree with the guild this
            // client serves, and a session for one guild must not authorise a
            // login to another guild's chat.
            if ($this->sessionGuildId($request) !== $guildId) {
                throw OAuthServerException::accessDenied(
                    'This session was not established for the guild this client serves',
                    $authRequest->getRedirectUri()
                );
            }

            $player = $this->claimsManager->findEligiblePlayer($playerId, $guildId);

            if ($player === null) {
                throw OAuthServerException::accessDenied(
                    'This player is not an approved member of this guild',
                    $authRequest->getRedirectUri()
                );
            }

            $this->authCodeRepository->stageAuthorizationDetails(
                $this->stringOrNull($queryParameters['nonce'] ?? null),
                $authRequest->getCodeChallenge(),
                $authRequest->getCodeChallengeMethod()
            );

            $authRequest->setUser(new UserEntity((string) $player['id']));
            $authRequest->setAuthorizationApproved(true);

            $response = $server->completeAuthorizationRequest($authRequest, $psrResponse);

            if ($pendingRequestId !== null) {
                $this->authorizationRequestManager->consume($pendingRequestId);
            }

            return $this->toSymfony($response);
        } catch (OAuthServerException $exception) {
            return $this->toSymfony($exception->generateHttpResponse($psrResponse));
        } catch (Throwable $exception) {
            return $this->toSymfony(
                OAuthServerException::serverError($exception->getMessage(), $exception)
                    ->generateHttpResponse($psrResponse)
            );
        }
    }

    /**
     * MAS is a confidential client, so the library would let it skip PKCE. This
     * provider requires it anyway: a stolen authorization code is then useless
     * without the verifier that never left the client.
     *
     * @throws OAuthServerException
     */
    private function assertPkce(AuthorizationRequestInterface $authRequest): void
    {
        if ($authRequest->getCodeChallenge() === null) {
            throw $this->invalidAuthorizationRequest(
                $authRequest,
                'This provider requires PKCE on every authorization request'
            );
        }

        if ($authRequest->getCodeChallengeMethod() !== 'S256') {
            throw $this->invalidAuthorizationRequest(
                $authRequest,
                'Only the S256 code challenge method is supported'
            );
        }
    }

    /**
     * The client and redirect URI have already been validated by the time this
     * is reachable, so the error goes back to the client rather than being
     * rendered at the provider (RFC 6749 section 4.1.2.1). The state is carried
     * along so the client can match the failure to its request.
     */
    private function invalidAuthorizationRequest(
        AuthorizationRequestInterface $authRequest,
        string $hint
    ): OAuthServerException {
        $exception = new OAuthServerException(
            'The request is missing a required parameter, includes an invalid parameter value, '
            . 'includes a parameter more than once, or is otherwise malformed.',
            3,
            'invalid_request',
            400,
            $hint,
            $this->redirectUriFor($authRequest)
        );

        $state = $authRequest->getState();

        if ($state !== null) {
            $exception->setPayload($exception->getPayload() + ['state' => $state]);
        }

        return $exception;
    }

    private function redirectUriFor(AuthorizationRequestInterface $authRequest): string
    {
        $requested = $authRequest->getRedirectUri();

        if ($requested !== null) {
            return $requested;
        }

        // Omitting redirect_uri is only valid when the client registered exactly
        // one, which the library already enforced.
        $registered = $authRequest->getClient()->getRedirectUri();

        return is_array($registered) ? (string) reset($registered) : $registered;
    }

    /**
     * Park the request and hand the browser to the SPA.
     *
     * The SPA keeps the player's wallet in local storage and logs in on boot,
     * so in the common case the player sees a loading screen rather than a
     * login prompt.
     *
     * @param array<string, mixed> $queryParameters
     */
    private function redirectToLogin(array $queryParameters): RedirectResponse
    {
        $requestId = $this->authorizationRequestManager->park($queryParameters);

        return new RedirectResponse('/?' . http_build_query([self::SPA_CONTINUE_PARAMETER => $requestId]));
    }

    private function sessionPlayerId(Request $request): ?string
    {
        return $this->sessionString($request, 'player_id');
    }

    private function sessionGuildId(Request $request): ?string
    {
        return $this->sessionString($request, 'guild_id');
    }

    private function sessionString(Request $request, string $key): ?string
    {
        if (!$request->hasSession()) {
            return null;
        }

        $value = $request->getSession()->get($key);

        return is_string($value) && $value !== '' ? $value : null;
    }

    /**
     * The guild a client is registered to serve. Anything other than our own
     * client entity cannot be scoped to a guild, so it is refused rather than
     * defaulted.
     *
     * @throws OAuthServerException
     */
    private function guildIdFor(AuthorizationRequestInterface $authRequest): string
    {
        $client = $authRequest->getClient();

        if (!$client instanceof ClientEntity) {
            throw OAuthServerException::serverError('OAuth client is not bound to a guild');
        }

        return $client->getGuildId();
    }

    /**
     * @return string[]
     */
    private function scopesFrom(ServerRequestInterface $request): array
    {
        $scopes = $request->getAttribute('oauth_scopes');

        if (!is_array($scopes)) {
            return [];
        }

        return array_values(array_map('strval', $scopes));
    }

    private function loginNotEstablishedResponse(): Response
    {
        return new Response(
            'Sign-in did not complete. Your browser may be blocking cookies for this site. '
            . 'Open the guild webapp directly, sign in, then start the Matrix login again.',
            Response::HTTP_UNAUTHORIZED,
            ['Content-Type' => 'text/plain; charset=UTF-8']
        );
    }

    private function assertEnabled(): void
    {
        if (!$this->config->isEnabled()) {
            throw $this->createNotFoundException('The OIDC provider is not enabled on this guild');
        }
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }

    private function psrRequest(Request $request): ServerRequestInterface
    {
        $psr17Factory = new Psr17Factory();

        return (new PsrHttpFactory($psr17Factory, $psr17Factory, $psr17Factory, $psr17Factory))
            ->createRequest($request);
    }

    private function psrResponse(): ResponseInterface
    {
        return (new Psr17Factory())->createResponse();
    }

    private function toSymfony(ResponseInterface $response): Response
    {
        return (new HttpFoundationFactory())->createResponse($response);
    }
}
