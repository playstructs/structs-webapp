<?php declare(strict_types=1);

namespace App\Tests\Oidc;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Everything the provider must refuse. These are the cases where a mistake
 * turns into a security problem rather than a broken login.
 */
class OidcRejectionTest extends OidcProviderTestCase
{
    public function testUnknownClientIsRejectedWithoutRedirecting(): void
    {
        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters(['client_id' => 'not-a-registered-client']),
            self::PLAYER_ID
        ));

        self::assertNotSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertNull($response->headers->get('Location'), 'An unknown client must never trigger a redirect');
    }

    public function testUnregisteredRedirectUriIsRejectedWithoutRedirecting(): void
    {
        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters(['redirect_uri' => 'https://attacker.example/callback']),
            self::PLAYER_ID
        ));

        self::assertNotSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertNull(
            $response->headers->get('Location'),
            'A mismatched redirect URI must not become an open redirect'
        );
    }

    public function testTrailingSlashOnRedirectUriIsNotAMatch(): void
    {
        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters(['redirect_uri' => self::REDIRECT_URI . '/']),
            self::PLAYER_ID
        ));

        self::assertNotSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertNull($response->headers->get('Location'));
    }

    public function testAuthorizeWithoutPkceIsRejected(): void
    {
        $parameters = $this->authorizeParameters();
        unset($parameters['code_challenge'], $parameters['code_challenge_method']);

        $response = $this->controller->authorize(
            $this->authorizeRequest($parameters, self::PLAYER_ID)
        );

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=invalid_request', $response->headers->get('Location'));
        self::assertStringNotContainsString('code=', $response->headers->get('Location'));
    }

    public function testPlainCodeChallengeMethodIsRejected(): void
    {
        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters([
                'code_challenge'        => $this->codeVerifier(),
                'code_challenge_method' => 'plain',
            ]),
            self::PLAYER_ID
        ));

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=invalid_request', $response->headers->get('Location'));
        self::assertStringNotContainsString('code=', $response->headers->get('Location'));
    }

    public function testPlayerWithoutAnApprovedAddressIsDenied(): void
    {
        $this->revokePlayer(self::PLAYER_ID);

        $response = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID)
        );

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=access_denied', $response->headers->get('Location'));
        self::assertStringNotContainsString('code=', $response->headers->get('Location'));
    }

    public function testSessionForAnUnknownPlayerIsDenied(): void
    {
        // A session can outlive the player row it names. Eligibility is resolved
        // from the database on every authorize, so a stale session is refused
        // rather than trusted.
        $response = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), '1-999')
        );

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=access_denied', $response->headers->get('Location'));
    }

    public function testReusedAuthorizationCodeIsRejectedAndRevokesItsTokens(): void
    {
        $code = $this->issueCode();

        $first = $this->controller->token($this->tokenRequest($code));
        self::assertSame(Response::HTTP_OK, $first->getStatusCode());

        $second = $this->controller->token($this->tokenRequest($code));
        self::assertSame(Response::HTTP_BAD_REQUEST, $second->getStatusCode());
        self::assertSame('invalid_grant', $this->jsonBody($second->getContent())['error']);

        foreach ($this->database->accessTokens as $token) {
            self::assertNotNull(
                $token['revoked_at'],
                'A replayed code means the code leaked, so its tokens must be withdrawn'
            );
        }
    }

    public function testTokenIssuedByAReplayedCodeStopsWorkingAtUserinfo(): void
    {
        $code = $this->issueCode();

        $accessToken = $this->jsonBody(
            $this->controller->token($this->tokenRequest($code))->getContent()
        )['access_token'];

        $this->controller->token($this->tokenRequest($code));

        $request = Request::create('/oauth/userinfo', 'GET');
        $request->headers->set('Authorization', 'Bearer ' . $accessToken);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->controller->userinfo($request)->getStatusCode());
    }

    public function testWrongPkceVerifierIsRejected(): void
    {
        $response = $this->controller->token($this->tokenRequest(
            $this->issueCode(),
            ['code_verifier' => 'a-completely-different-verifier-that-is-long-enough-01234']
        ));

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('invalid_grant', $this->jsonBody($response->getContent())['error']);
    }

    public function testWrongClientSecretIsRejected(): void
    {
        $response = $this->controller->token($this->tokenRequest(
            $this->issueCode(),
            ['client_secret' => 'not-the-secret']
        ));

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertSame('invalid_client', $this->jsonBody($response->getContent())['error']);
    }

    public function testRedirectUriMustMatchAtTokenExchange(): void
    {
        $response = $this->controller->token($this->tokenRequest(
            $this->issueCode(),
            ['redirect_uri' => 'https://attacker.example/callback']
        ));

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertSame('invalid_request', $this->jsonBody($response->getContent())['error']);
    }

    public function testUserinfoRejectsAMissingBearerToken(): void
    {
        $response = $this->controller->userinfo(Request::create('/oauth/userinfo', 'GET'));

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
    }

    public function testUserinfoRejectsAPlayerRevokedAfterTheTokenWasIssued(): void
    {
        $accessToken = $this->jsonBody(
            $this->controller->token($this->tokenRequest($this->issueCode()))->getContent()
        )['access_token'];

        $this->revokePlayer(self::PLAYER_ID);

        $request = Request::create('/oauth/userinfo', 'GET');
        $request->headers->set('Authorization', 'Bearer ' . $accessToken);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->controller->userinfo($request)->getStatusCode());
    }

    public function testResumeWithAnUnknownRequestIdGoesHomeRatherThanAnywhereChosen(): void
    {
        $response = $this->controller->resume($this->resumeRequest('not-a-real-request-id', self::PLAYER_ID));

        self::assertSame('/', $response->headers->get('Location'));
    }

    public function testResumeWithoutASessionDoesNotLoopBackIntoTheSpa(): void
    {
        $parkResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), null)
        );
        parse_str((string) parse_url($parkResponse->getTargetUrl(), PHP_URL_QUERY), $query);

        $response = $this->controller->resume($this->resumeRequest($query['oidc'], null));

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertNull($response->headers->get('Location'));
    }

    public function testAParkedRequestCannotBeResumedTwice(): void
    {
        $parkResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), null)
        );
        parse_str((string) parse_url($parkResponse->getTargetUrl(), PHP_URL_QUERY), $query);

        $this->controller->resume($this->resumeRequest($query['oidc'], self::PLAYER_ID));
        $second = $this->controller->resume($this->resumeRequest($query['oidc'], self::PLAYER_ID));

        self::assertSame('/', $second->headers->get('Location'));
    }
}
