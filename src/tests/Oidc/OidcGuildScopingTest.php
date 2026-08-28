<?php declare(strict_types=1);

namespace App\Tests\Oidc;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A single webapp can act as the identity provider for several guilds' Matrix
 * deployments through one issuer. These tests cover the boundary that makes
 * that safe: a client registered for one guild must never be able to obtain an
 * identity for a player of another.
 */
class OidcGuildScopingTest extends OidcProviderTestCase
{
    private const string OTHER_REDIRECT_URI = 'https://auth.other-guild.test.structs.game/upstream/callback/01';

    private const string OTHER_PLAYER_ID = '1-77';

    protected function setUp(): void
    {
        parent::setUp();

        $this->registerClient(self::OTHER_CLIENT_ID, self::OTHER_GUILD_ID, self::OTHER_REDIRECT_URI);
        $this->approvePlayer(self::OTHER_PLAYER_ID, self::OTHER_GUILD_ID, 'OtherPilot');
    }

    public function testEachGuildsClientAuthenticatesItsOwnPlayers(): void
    {
        $ours = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID, self::GUILD_ID)
        );

        $theirs = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters([
                'client_id'    => self::OTHER_CLIENT_ID,
                'redirect_uri' => self::OTHER_REDIRECT_URI,
            ]),
            self::OTHER_PLAYER_ID,
            self::OTHER_GUILD_ID
        ));

        self::assertSame(Response::HTTP_FOUND, $ours->getStatusCode());
        self::assertSame(Response::HTTP_FOUND, $theirs->getStatusCode());

        self::assertStringStartsWith(self::REDIRECT_URI, $ours->headers->get('Location'));
        self::assertStringStartsWith(self::OTHER_REDIRECT_URI, $theirs->headers->get('Location'));
    }

    public function testAClientCannotAuthenticateAnotherGuildsPlayer(): void
    {
        // A player of the other guild, with a valid session for that guild,
        // arriving at our guild's client.
        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters(),
            self::OTHER_PLAYER_ID,
            self::OTHER_GUILD_ID
        ));

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=access_denied', $response->headers->get('Location'));
        self::assertStringNotContainsString('code=', $response->headers->get('Location'));
    }

    public function testASessionForAnotherGuildCannotAuthoriseThisGuildsClient(): void
    {
        // Same player, but their session was established against the other
        // guild. Membership alone must not be enough.
        $this->approvePlayer(self::PLAYER_ID, self::GUILD_ID, 'CoolPilot');

        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters(),
            self::PLAYER_ID,
            self::OTHER_GUILD_ID
        ));

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=access_denied', $response->headers->get('Location'));
        self::assertStringNotContainsString('code=', $response->headers->get('Location'));
    }

    public function testASessionWithNoGuildIsRefused(): void
    {
        $response = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID, null)
        );

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=access_denied', $response->headers->get('Location'));
    }

    public function testResumeAppliesTheSameGuildBoundary(): void
    {
        $parkResponse = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), null)
        );
        parse_str((string) parse_url($parkResponse->getTargetUrl(), PHP_URL_QUERY), $query);

        // The player completes login, but into the wrong guild.
        $response = $this->controller->resume(
            $this->resumeRequest($query['oidc'], self::PLAYER_ID, self::OTHER_GUILD_ID)
        );

        self::assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        self::assertStringContainsString('error=access_denied', $response->headers->get('Location'));
        self::assertStringNotContainsString('code=', $response->headers->get('Location'));
    }

    public function testIdTokensCarryTheIssuingGuild(): void
    {
        $response = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters([
                'client_id'    => self::OTHER_CLIENT_ID,
                'redirect_uri' => self::OTHER_REDIRECT_URI,
            ]),
            self::OTHER_PLAYER_ID,
            self::OTHER_GUILD_ID
        ));

        $tokenResponse = $this->controller->token($this->tokenRequest(
            $this->codeFromRedirect($response->headers->get('Location')),
            ['client_id' => self::OTHER_CLIENT_ID, 'redirect_uri' => self::OTHER_REDIRECT_URI]
        ));

        $claims = $this->decodeJwtClaims($this->jsonBody($tokenResponse->getContent())['id_token']);

        self::assertSame(self::OTHER_PLAYER_ID, $claims['sub']);
        self::assertSame(self::OTHER_GUILD_ID, $claims['guild_id']);
        self::assertSame([self::OTHER_CLIENT_ID], (array) $claims['aud']);
    }

    public function testBothGuildsShareOneIssuerAndOneSigningKey(): void
    {
        $ours = $this->issueCode();
        $theirsResponse = $this->controller->authorize($this->authorizeRequest(
            $this->authorizeParameters([
                'client_id'    => self::OTHER_CLIENT_ID,
                'redirect_uri' => self::OTHER_REDIRECT_URI,
            ]),
            self::OTHER_PLAYER_ID,
            self::OTHER_GUILD_ID
        ));

        $ourClaims = $this->decodeJwtClaims(
            $this->jsonBody($this->controller->token($this->tokenRequest($ours))->getContent())['id_token']
        );

        $theirToken = $this->controller->token($this->tokenRequest(
            $this->codeFromRedirect($theirsResponse->headers->get('Location')),
            ['client_id' => self::OTHER_CLIENT_ID, 'redirect_uri' => self::OTHER_REDIRECT_URI]
        ));
        $theirClaims = $this->decodeJwtClaims($this->jsonBody($theirToken->getContent())['id_token']);

        self::assertSame($ourClaims['iss'], $theirClaims['iss'], 'A shared webapp is one issuer');
        self::assertSame(self::ISSUER, $ourClaims['iss']);
    }

    public function testUserinfoIsScopedToTheTokensGuild(): void
    {
        $accessToken = $this->jsonBody(
            $this->controller->token($this->tokenRequest($this->issueCode()))->getContent()
        )['access_token'];

        // The player leaves for the other guild after the token was issued.
        $this->approvePlayer(self::PLAYER_ID, self::OTHER_GUILD_ID, 'CoolPilot');

        $request = Request::create('/oauth/userinfo', 'GET');
        $request->headers->set('Authorization', 'Bearer ' . $accessToken);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->controller->userinfo($request)->getStatusCode());
    }
}
