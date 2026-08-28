<?php declare(strict_types=1);

namespace App\Tests\Oidc;

use App\Controller\OidcController;
use App\Manager\OidcAuthorizationRequestManager;
use App\Manager\OidcClaimsManager;
use App\Oidc\AuthorizationServerFactory;
use App\Oidc\IdTokenContext;
use App\Oidc\IdTokenResponse;
use App\Oidc\JwksBuilder;
use App\Oidc\OidcConfig;
use App\Oidc\Repository\AccessTokenRepository;
use App\Oidc\Repository\AuthCodeRepository;
use App\Oidc\Repository\ClientRepository;
use App\Oidc\Repository\RefreshTokenRepository;
use App\Oidc\Repository\ScopeRepository;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;

/**
 * Shared fixture for the OIDC provider tests.
 *
 * The provider is assembled by hand rather than pulled from the container, so
 * each test controls the database contents and the session outright.
 */
abstract class OidcProviderTestCase extends TestCase
{
    protected const string ISSUER = 'https://guild.test.structs.game';

    protected const string CLIENT_ID = 'matrix-auth-service';

    protected const string CLIENT_SECRET = 'test-client-secret';

    protected const string REDIRECT_URI = 'https://auth.guild.test.structs.game/upstream/callback/01';

    protected const string PLAYER_ID = '1-42';

    protected const string GUILD_ID = '0-1';

    /**
     * A second guild sharing this webapp, used to prove one guild's Matrix
     * deployment cannot authenticate another guild's players.
     */
    protected const string OTHER_GUILD_ID = '0-2';

    protected const string OTHER_CLIENT_ID = 'matrix-auth-service-other-guild';

    private static ?string $keyDirectory = null;

    protected InMemoryOidcDatabase $database;

    protected OidcController $controller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->database = new InMemoryOidcDatabase();

        $this->registerClient(self::CLIENT_ID, self::GUILD_ID, self::REDIRECT_URI);
        $this->approvePlayer(self::PLAYER_ID, self::GUILD_ID, 'CoolPilot');

        $this->controller = $this->buildController();
    }

    protected function registerClient(string $clientId, string $guildId, string $redirectUri): void
    {
        $this->database->clients[$clientId] = [
            'client_id'          => $clientId,
            'guild_id'           => $guildId,
            'name'               => 'Matrix Authentication Service',
            'client_secret_hash' => password_hash(self::CLIENT_SECRET, PASSWORD_DEFAULT),
            'redirect_uris'      => '{"' . $redirectUri . '"}',
            'scopes'             => '{"openid","profile"}',
            'is_confidential'    => true,
            'enabled'            => true,
        ];
    }

    protected function approvePlayer(string $playerId, string $guildId, ?string $username = null): void
    {
        $this->database->eligiblePlayers[$playerId] = [
            'id'              => $playerId,
            'primary_address' => 'structs1abcxyz',
            'guild_id'        => $guildId,
            'username'        => $username,
            'pfp'             => null,
        ];
    }

    protected function revokePlayer(string $playerId): void
    {
        unset($this->database->eligiblePlayers[$playerId]);
    }

    /**
     * The provider reads and writes through raw DBAL, so the connection is
     * where the test double has to sit.
     */
    private function buildEntityManager(): EntityManagerInterface
    {
        $connection = $this->createStub(Connection::class);

        $connection->method('fetchAssociative')
            ->willReturnCallback(fn (string $sql, array $params = []) => $this->database->fetchAssociative($sql, $params));

        $connection->method('fetchOne')
            ->willReturnCallback(fn (string $sql, array $params = []) => $this->database->fetchOne($sql, $params));

        $connection->method('executeStatement')
            ->willReturnCallback(fn (string $sql, array $params = []) => $this->database->executeStatement($sql, $params));

        $entityManager = $this->createStub(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);

        return $entityManager;
    }

    private function buildController(): OidcController
    {
        $config = $this->buildConfig();
        $entityManager = $this->buildEntityManager();

        $idTokenContext = new IdTokenContext();
        $claimsManager = new OidcClaimsManager($entityManager);
        $clientRepository = new ClientRepository($entityManager);
        $accessTokenRepository = new AccessTokenRepository($entityManager, $idTokenContext);
        $authCodeRepository = new AuthCodeRepository($entityManager, $accessTokenRepository);
        $scopeRepository = new ScopeRepository($config, $idTokenContext);

        $serverFactory = new AuthorizationServerFactory(
            $config,
            $clientRepository,
            $accessTokenRepository,
            $scopeRepository,
            $authCodeRepository,
            new RefreshTokenRepository(),
            new IdTokenResponse($config, $claimsManager, $authCodeRepository, $idTokenContext)
        );

        return new OidcController(
            $config,
            $serverFactory,
            $claimsManager,
            new OidcAuthorizationRequestManager($entityManager),
            $authCodeRepository,
            $clientRepository,
            new JwksBuilder($config)
        );
    }

    private function buildConfig(): OidcConfig
    {
        $directory = $this->keyDirectory();

        return new OidcConfig(
            true,
            self::ISSUER,
            self::CLIENT_ID,
            self::CLIENT_SECRET,
            self::REDIRECT_URI,
            $directory . '/private.key',
            $directory . '/public.key',
            'test-key-1',
            'a-thirty-two-byte-test-encryption',
            $directory
        );
    }

    /**
     * Generating a 2048-bit key takes long enough to be worth doing once for the
     * whole suite rather than per test.
     */
    private function keyDirectory(): string
    {
        if (self::$keyDirectory !== null) {
            return self::$keyDirectory;
        }

        $directory = sys_get_temp_dir() . '/structs-oidc-test-keys';

        if (!is_dir($directory)) {
            mkdir($directory, 0o700, true);
        }

        if (!file_exists($directory . '/private.key')) {
            $key = openssl_pkey_new([
                'private_key_bits' => 2048,
                'private_key_type' => OPENSSL_KEYTYPE_RSA,
            ]);

            $privateKey = '';
            openssl_pkey_export($key, $privateKey);
            $details = openssl_pkey_get_details($key);

            file_put_contents($directory . '/private.key', $privateKey);
            chmod($directory . '/private.key', 0o600);
            file_put_contents($directory . '/public.key', $details['key']);
        }

        return self::$keyDirectory = $directory;
    }

    /**
     * @param array<string, string> $overrides
     *
     * @return array<string, string>
     */
    protected function authorizeParameters(array $overrides = []): array
    {
        return array_merge([
            'response_type'         => 'code',
            'client_id'             => self::CLIENT_ID,
            'redirect_uri'          => self::REDIRECT_URI,
            'scope'                 => 'openid profile',
            'state'                 => 'opaque-state-value',
            'nonce'                 => 'opaque-nonce-value',
            'code_challenge'        => $this->codeChallenge(),
            'code_challenge_method' => 'S256',
        ], $overrides);
    }

    protected function codeVerifier(): string
    {
        return 'structs-test-code-verifier-that-is-long-enough-0123456789';
    }

    protected function codeChallenge(): string
    {
        return rtrim(strtr(base64_encode(hash('sha256', $this->codeVerifier(), true)), '+/', '-_'), '=');
    }

    /**
     * @param array<string, string> $parameters
     */
    protected function authorizeRequest(array $parameters, ?string $playerId, ?string $guildId = self::GUILD_ID): Request
    {
        $request = Request::create('/oauth/authorize', 'GET', $parameters);
        $request->setSession($this->session($playerId, $guildId));

        return $request;
    }

    protected function resumeRequest(string $requestId, ?string $playerId, ?string $guildId = self::GUILD_ID): Request
    {
        $request = Request::create('/oauth/resume', 'GET', ['request_id' => $requestId]);
        $request->setSession($this->session($playerId, $guildId));

        return $request;
    }

    /**
     * Mirrors what AuthManager::login writes: the player and the guild they
     * signed in to, which are separate facts.
     */
    private function session(?string $playerId, ?string $guildId): Session
    {
        $session = new Session(new MockArraySessionStorage());

        if ($playerId !== null) {
            $session->set('player_id', $playerId);
        }

        if ($playerId !== null && $guildId !== null) {
            $session->set('guild_id', $guildId);
        }

        return $session;
    }

    /**
     * Runs a complete authorize for the default approved player and returns the
     * authorization code, for tests whose subject is the token exchange.
     */
    protected function issueCode(): string
    {
        $response = $this->controller->authorize(
            $this->authorizeRequest($this->authorizeParameters(), self::PLAYER_ID)
        );

        return $this->codeFromRedirect((string) $response->headers->get('Location'));
    }

    /**
     * Pulls the authorization code out of a successful authorize redirect.
     */
    protected function codeFromRedirect(string $location): string
    {
        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);

        self::assertArrayHasKey('code', $query, "No authorization code in redirect: {$location}");

        return (string) $query['code'];
    }

    /**
     * @param array<string, string> $overrides
     */
    protected function tokenRequest(string $code, array $overrides = []): Request
    {
        return Request::create('/oauth/token', 'POST', array_merge([
            'grant_type'    => 'authorization_code',
            'client_id'     => self::CLIENT_ID,
            'client_secret' => self::CLIENT_SECRET,
            'redirect_uri'  => self::REDIRECT_URI,
            'code'          => $code,
            'code_verifier' => $this->codeVerifier(),
        ], $overrides));
    }

    /**
     * @return array<string, mixed>
     */
    protected function decodeJwtClaims(string $jwt): array
    {
        $parts = explode('.', $jwt);
        self::assertCount(3, $parts, 'ID token is not a well-formed JWT');

        $payload = base64_decode(strtr($parts[1], '-_', '+/'), true);
        self::assertIsString($payload);

        return json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * @return array<string, mixed>
     */
    protected function decodeJwtHeader(string $jwt): array
    {
        $parts = explode('.', $jwt);
        $header = base64_decode(strtr($parts[0], '-_', '+/'), true);
        self::assertIsString($header);

        return json_decode($header, true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * @return array<string, mixed>
     */
    protected function jsonBody(string $content): array
    {
        return json_decode($content, true, 512, JSON_THROW_ON_ERROR);
    }
}
