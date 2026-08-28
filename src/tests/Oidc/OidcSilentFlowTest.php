<?php declare(strict_types=1);

namespace App\Tests\Oidc;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * The path a player takes when they are already signed in to the webapp: no
 * prompt, no second signature, straight back to Matrix with a code.
 */
class OidcSilentFlowTest extends OidcProviderTestCase
{
    public function testDiscoveryAdvertisesTheConfiguredIssuer(): void
    {
        $document = $this->jsonBody($this->controller->discovery()->getContent());

        self::assertSame(self::ISSUER, $document['issuer']);
        self::assertSame(self::ISSUER . '/oauth/authorize', $document['authorization_endpoint']);
        self::assertSame(self::ISSUER . '/oauth/token', $document['token_endpoint']);
        self::assertSame(self::ISSUER . '/oauth/jwks', $document['jwks_uri']);
        self::assertSame(self::ISSUER . '/oauth/userinfo', $document['userinfo_endpoint']);
        self::assertSame(['code'], $document['response_types_supported']);
        self::assertSame(['authorization_code'], $document['grant_types_supported']);
        self::assertSame(['S256'], $document['code_challenge_methods_supported']);
        self::assertSame(['RS256'], $document['id_token_signing_alg_values_supported']);
    }

    public function testJwksPublishesTheSigningKey(): void
    {
        $jwks = $this->jsonBody($this->controller->jwks()->getContent());

        self::assertCount(1, $jwks['keys']);
        self::assertSame('RSA', $jwks['keys'][0]['kty']);
        self::assertSame('RS256', $jwks['keys'][0]['alg']);
        self::assertSame('sig', $jwks['keys'][0]['use']);
        self::assertSame('test-key-1', $jwks['keys'][0]['kid']);
        self::assertNotEmpty($jwks['keys'][0]['n']);
        self::assertNotEmpty($jwks['keys'][0]['e']);
    }

    public function testAuthorizeWithSessionRedirectsWithCodeAndState(): void
    {
        $response = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID)
        );

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());

        $location = $response->headers->get('Location');
        self::assertStringStartsWith(self::REDIRECT_URI, $location);

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);
        self::assertSame('opaque-state-value', $query['state']);
        self::assertNotEmpty($query['code']);
    }

    public function testTokenExchangeReturnsAnIdTokenSubjectedToThePlayerId(): void
    {
        $authorizeResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID)
        );
        $code = $this->codeFromRedirect($authorizeResponse->headers->get('Location'));

        $tokenResponse = $this->controller->token($this->tokenRequest($code));

        self::assertSame(Response::HTTP_OK, $tokenResponse->getStatusCode());

        $body = $this->jsonBody($tokenResponse->getContent());

        self::assertSame('Bearer', $body['token_type']);
        self::assertArrayHasKey('access_token', $body);
        self::assertArrayHasKey('id_token', $body);
        self::assertArrayNotHasKey('refresh_token', $body, 'This provider must not issue refresh tokens');

        $claims = $this->decodeJwtClaims($body['id_token']);

        self::assertSame(self::PLAYER_ID, $claims['sub'], 'sub becomes the Matrix localpart and must be the player id');
        self::assertSame(self::ISSUER, $claims['iss']);
        self::assertSame([self::CLIENT_ID], (array) $claims['aud']);
        self::assertSame('opaque-nonce-value', $claims['nonce']);
        self::assertSame('CoolPilot', $claims['preferred_username']);
        self::assertSame('structs1abcxyz', $claims['primary_address']);
        self::assertGreaterThan(time(), $claims['exp']);

        self::assertSame('test-key-1', $this->decodeJwtHeader($body['id_token'])['kid']);
    }

    /**
     * MAS (openidconnect-rs) refuses a NumericDate that carries a fractional
     * part, failing the upstream callback with `invalid claim "exp"`. The JWT
     * library serialises microseconds by default, so this guards the formatter
     * that stops it.
     */
    public function testIdTokenDatesAreWholeSecondNumericDates(): void
    {
        $idToken = $this->jsonBody(
            $this->controller->token($this->tokenRequest($this->issueCode()))->getContent()
        )['id_token'];

        $claims = $this->decodeJwtClaims($idToken);

        self::assertIsInt($claims['iat']);
        self::assertIsInt($claims['exp']);

        // MAS parses the bytes rather than PHP's decoding of them, so assert on
        // the serialised form too: 1787928562, never 1787928562.571061.
        $payload = (string) base64_decode(strtr(explode('.', $idToken)[1], '-_', '+/'), true);

        self::assertMatchesRegularExpression('/"iat":\d+[,}]/', $payload);
        self::assertMatchesRegularExpression('/"exp":\d+[,}]/', $payload);
    }

    public function testIdTokenVerifiesAgainstThePublishedJwks(): void
    {
        $authorizeResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID)
        );
        $tokenResponse = $this->controller->token(
            $this->tokenRequest($this->codeFromRedirect($authorizeResponse->headers->get('Location')))
        );

        $idToken = $this->jsonBody($tokenResponse->getContent())['id_token'];
        [$header, $payload, $signature] = explode('.', $idToken);

        $jwk = $this->jsonBody($this->controller->jwks()->getContent())['keys'][0];

        $verified = openssl_verify(
            "{$header}.{$payload}",
            $this->base64UrlDecode($signature),
            $this->publicKeyFromJwk($jwk),
            OPENSSL_ALGO_SHA256
        );

        self::assertSame(1, $verified, 'The published JWKS must verify a freshly issued ID token');
    }

    public function testUserinfoReturnsTheSameSubjectAsTheIdToken(): void
    {
        $authorizeResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID)
        );
        $tokenResponse = $this->controller->token(
            $this->tokenRequest($this->codeFromRedirect($authorizeResponse->headers->get('Location')))
        );
        $body = $this->jsonBody($tokenResponse->getContent());

        $request = \Symfony\Component\HttpFoundation\Request::create('/oauth/userinfo', 'GET');
        $request->headers->set('Authorization', 'Bearer ' . $body['access_token']);

        $userinfo = $this->controller->userinfo($request);

        self::assertSame(Response::HTTP_OK, $userinfo->getStatusCode());

        $claims = $this->jsonBody($userinfo->getContent());

        self::assertSame(self::PLAYER_ID, $claims['sub']);
        self::assertSame('CoolPilot', $claims['preferred_username']);
    }

    public function testAuthorizeWithoutSessionParksTheRequestAndRedirectsToTheSpa(): void
    {
        $response = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), null)
        );

        self::assertInstanceOf(RedirectResponse::class, $response);

        $location = $response->getTargetUrl();
        self::assertStringStartsWith('/?oidc=', $location);

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);
        self::assertArrayHasKey($query['oidc'], $this->database->authorizationRequests);

        $parked = $this->database->authorizationRequests[$query['oidc']];
        self::assertSame(self::CLIENT_ID, $parked['client_id']);
        self::assertSame('opaque-nonce-value', $parked['nonce']);
        self::assertSame($this->codeChallenge(), $parked['code_challenge']);
    }

    public function testResumeAfterLoginCompletesTheParkedRequest(): void
    {
        $parkResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), null)
        );
        parse_str((string) parse_url($parkResponse->getTargetUrl(), PHP_URL_QUERY), $query);
        $requestId = $query['oidc'];

        $resumeResponse = $this->controller->resume($this->resumeRequest($requestId, self::PLAYER_ID));

        self::assertSame(Response::HTTP_FOUND, $resumeResponse->getStatusCode());

        $location = $resumeResponse->headers->get('Location');
        self::assertStringStartsWith(self::REDIRECT_URI, $location);

        parse_str((string) parse_url($location, PHP_URL_QUERY), $redirectQuery);
        self::assertSame('opaque-state-value', $redirectQuery['state']);
        self::assertNotEmpty($redirectQuery['code']);

        self::assertNotNull(
            $this->database->authorizationRequests[$requestId]['consumed_at'],
            'A resumed request must not be resumable again'
        );
    }

    public function testResumedCodeCarriesTheOriginalNonce(): void
    {
        $parkResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), null)
        );
        parse_str((string) parse_url($parkResponse->getTargetUrl(), PHP_URL_QUERY), $query);

        $resumeResponse = $this->controller->resume($this->resumeRequest($query['oidc'], self::PLAYER_ID));
        $tokenResponse = $this->controller->token(
            $this->tokenRequest($this->codeFromRedirect($resumeResponse->headers->get('Location')))
        );

        $claims = $this->decodeJwtClaims($this->jsonBody($tokenResponse->getContent())['id_token']);

        self::assertSame('opaque-nonce-value', $claims['nonce']);
        self::assertSame(self::PLAYER_ID, $claims['sub']);
    }

    /**
     * @param array<string, string> $jwk
     *
     * @return resource|\OpenSSLAsymmetricKey
     */
    private function publicKeyFromJwk(array $jwk)
    {
        $modulus = $this->base64UrlDecode($jwk['n']);
        $exponent = $this->base64UrlDecode($jwk['e']);

        $components = $this->derSequence(
            $this->derInteger($modulus) . $this->derInteger($exponent)
        );

        $der = $this->derSequence(
            $this->derSequence(hex2bin('06092a864886f70d010101') . hex2bin('0500'))
            . $this->derBitString($components)
        );

        $pem = "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split(base64_encode($der), 64, "\n")
            . "-----END PUBLIC KEY-----\n";

        return openssl_pkey_get_public($pem);
    }

    private function derInteger(string $bytes): string
    {
        if (ord($bytes[0]) > 0x7F) {
            $bytes = "\x00" . $bytes;
        }

        return "\x02" . $this->derLength(strlen($bytes)) . $bytes;
    }

    private function derSequence(string $bytes): string
    {
        return "\x30" . $this->derLength(strlen($bytes)) . $bytes;
    }

    private function derBitString(string $bytes): string
    {
        $bytes = "\x00" . $bytes;

        return "\x03" . $this->derLength(strlen($bytes)) . $bytes;
    }

    private function derLength(int $length): string
    {
        if ($length < 0x80) {
            return chr($length);
        }

        $bytes = ltrim(pack('N', $length), "\x00");

        return chr(0x80 | strlen($bytes)) . $bytes;
    }

    private function base64UrlDecode(string $value): string
    {
        return (string) base64_decode(strtr($value, '-_', '+/'), true);
    }
}
