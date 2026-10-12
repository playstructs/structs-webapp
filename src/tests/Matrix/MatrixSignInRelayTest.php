<?php declare(strict_types=1);

namespace App\Tests\Matrix;

use App\Matrix\MasEndpoints;
use App\Matrix\MatrixSignInConfig;
use App\Matrix\MatrixSignInException;
use App\Matrix\MatrixSignInRelay;
use App\Oidc\OidcConfig;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Walks the relay through a scripted MAS, standing in for the network and for
 * this webapp's own kernel, and checks it behaves like a careful browser.
 */
class MatrixSignInRelayTest extends TestCase
{
    private const string MAS = 'https://auth.guild.test';

    private const string GUILD = 'https://guild.test';

    private const string HOMESERVER = 'http://synapse:8008';

    private const string SERVER_NAME = 'matrix.guild.test';

    private const string CLIENT_ID = 'public-client-01';

    private const string LOOPBACK = 'http://127.0.0.1:47411/guild/matrix/callback';

    private const string PLAYER_ID = '1-42';

    private const string GUILD_ID = '0-1';

    private const string DEVICE_ID = 'K3J9QX2M7A';

    /**
     * Every HTTP request the relay made, in order.
     *
     * @var array<int, array{method: string, url: string, headers: string[], body: string}>
     */
    private array $requests = [];

    /**
     * Every sub-request the relay dispatched to the kernel.
     *
     * @var Request[]
     */
    private array $kernelRequests = [];

    private ?string $authorizeState = null;

    private ?string $codeChallenge = null;

    public function testWalksTheWholeChainAndReturnsTheSession(): void
    {
        $relay = $this->relay($this->happyPathScript());

        $session = $relay->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        self::assertSame('@1-42:' . self::SERVER_NAME, $session->userId);
        self::assertSame(self::DEVICE_ID, $session->deviceId);
        self::assertSame('mat_access', $session->accessToken);
        self::assertSame('mar_refresh', $session->refreshToken);
        self::assertSame(300, $session->expiresIn);
        self::assertSame(self::CLIENT_ID, $session->clientId);
        self::assertSame(self::MAS . '/oauth2/token', $session->tokenEndpoint);
        self::assertSame(self::MAS . '/oauth2/revoke', $session->revocationEndpoint);

        $paths = array_map(fn (array $r) => $r['method'] . ' ' . $this->pathOf($r['url']), $this->requests);

        self::assertSame([
            'GET /.well-known/openid-configuration',
            'GET /authorize',
            'GET /login',
            'GET /upstream/authorize/01',
            'GET /upstream/callback/01',
            'GET /consent/xyz',
            'POST /consent/xyz',
            'POST /oauth2/token',
            'GET /_matrix/client/v3/account/whoami',
        ], $paths);

        foreach ($this->requests as $request) {
            self::assertNotSame('127.0.0.1', parse_url($request['url'], PHP_URL_HOST), 'The loopback URI must never be visited');
        }
    }

    public function testAuthorizeRequestCarriesTheDeviceScopeAndPkce(): void
    {
        $this->relay($this->happyPathScript())->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        parse_str((string) parse_url($this->requests[1]['url'], PHP_URL_QUERY), $query);

        self::assertSame('code', $query['response_type']);
        self::assertSame(self::CLIENT_ID, $query['client_id']);
        self::assertSame(self::LOOPBACK, $query['redirect_uri']);
        self::assertSame(
            MatrixSignInRelay::SCOPE_CLIENT_API . ' ' . MatrixSignInRelay::SCOPE_DEVICE_PREFIX . self::DEVICE_ID,
            $query['scope']
        );
        self::assertSame('S256', $query['code_challenge_method']);
        self::assertNotEmpty($query['state']);

        parse_str($this->requests[7]['body'], $tokenBody);

        self::assertSame('authorization_code', $tokenBody['grant_type']);
        self::assertSame('AUTHCODE', $tokenBody['code']);
        self::assertSame(self::LOOPBACK, $tokenBody['redirect_uri']);
        self::assertSame(self::CLIENT_ID, $tokenBody['client_id']);
        self::assertSame(
            $query['code_challenge'],
            rtrim(strtr(base64_encode(hash('sha256', $tokenBody['code_verifier'], true)), '+/', '-_'), '='),
            'The verifier sent to the token endpoint must hash to the challenge sent to authorize'
        );
    }

    public function testMasCookiesAreCarriedAcrossHops(): void
    {
        $this->relay($this->happyPathScript())->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        // Set on the first authorize response; must be present from the next MAS hop on.
        foreach (array_slice($this->requests, 2, 5) as $request) {
            self::assertStringContainsString('mas_session=abc123', $this->cookieHeader($request), $request['url']);
        }

        // But never sent to the homeserver.
        self::assertSame('', $this->cookieHeader($this->requests[8]));
    }

    public function testTheGuildHopIsServedInProcessWithThePlayersSession(): void
    {
        $this->relay($this->happyPathScript())->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        self::assertCount(1, $this->kernelRequests);

        $request = $this->kernelRequests[0];

        self::assertSame('/oauth/authorize', $request->getPathInfo());
        self::assertSame('guild.test', $request->getHost());
        self::assertSame(self::PLAYER_ID, $request->getSession()->get('player_id'));
        self::assertSame(self::GUILD_ID, $request->getSession()->get('guild_id'));
        self::assertSame('mas', $request->query->get('client_id'));

        foreach ($this->requests as $httpRequest) {
            self::assertNotSame('guild.test', parse_url($httpRequest['url'], PHP_URL_HOST), 'The webapp must not call itself over the network');
        }
    }

    public function testConsentIsAnsweredWithTheAffirmativeButton(): void
    {
        $this->relay($this->happyPathScript())->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        parse_str($this->requests[6]['body'], $consentBody);

        self::assertSame('csrf-token-value', $consentBody['csrf']);
        self::assertSame('allow', $consentBody['action']);
    }

    public function testAParkedAuthorizationIsResumed(): void
    {
        // A kernel that parks the first request and completes it on resume.
        $relay = $this->relay($this->happyPathScript(), parkFirst: true);

        $relay->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        self::assertSame(
            ['/oauth/authorize', '/oauth/resume'],
            array_map(fn (Request $r) => $r->getPathInfo(), $this->kernelRequests)
        );
        self::assertSame('parked-1', $this->kernelRequests[1]->query->get('request_id'));
    }

    public function testStopsWhenMasSendsTheChainToAnotherHost(): void
    {
        $script = $this->happyPathScript();
        $script['GET /login'] = fn () => new MockResponse('', ['http_code' => 302, 'response_headers' => ['Location' => 'https://evil.example/login']]);

        $this->expectExceptionObject(new MatrixSignInException(MatrixSignInException::STEP_AUTHORIZE, 'Sign-in chain was sent to an unexpected host: evil.example'));

        $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
    }

    public function testMasRefusalOnTheLoopbackIsReported(): void
    {
        $script = $this->happyPathScript();
        $script['POST /consent/xyz'] = fn () => $this->redirect(self::LOOPBACK . '?error=access_denied&error_description=Nope&state=' . $this->authorizeState);

        try {
            $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_CALLBACK, $exception->getStep());
            self::assertStringContainsString('access_denied: Nope', $exception->getMessage());
        }
    }

    public function testAWrongStateOnTheLoopbackIsRefused(): void
    {
        $script = $this->happyPathScript();
        $script['POST /consent/xyz'] = fn () => $this->redirect(self::LOOPBACK . '?code=AUTHCODE&state=someone-elses');

        $this->expectExceptionObject(new MatrixSignInException(MatrixSignInException::STEP_CALLBACK, 'State on the redirect did not match'));

        $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
    }

    public function testAPageNeedingAPersonStopsTheChain(): void
    {
        $script = $this->happyPathScript();
        $script['GET /consent/xyz'] = fn () => new MockResponse(
            '<html><head><title>Verify your email</title></head><body><form method="get" action="/x"></form></body></html>',
            ['http_code' => 200, 'response_headers' => ['Content-Type' => 'text/html']]
        );

        try {
            $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_CONSENT, $exception->getStep());
            self::assertStringContainsString('Verify your email', $exception->getMessage());
        }
    }

    public function testAFormPostingOffTheMasHostIsNotSubmitted(): void
    {
        $script = $this->happyPathScript();
        $script['GET /consent/xyz'] = fn () => new MockResponse(
            '<html><body><form method="post" action="https://evil.example/steal"><input type="hidden" name="csrf" value="x"></form></body></html>',
            ['http_code' => 200, 'response_headers' => ['Content-Type' => 'text/html']]
        );

        try {
            $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_CONSENT, $exception->getStep());
            self::assertCount(6, $this->requests, 'Nothing may be posted off-host');
        }
    }

    public function testARedirectLoopIsCutOff(): void
    {
        $script = $this->happyPathScript();
        $script['GET /login'] = fn () => $this->redirect('/login');

        try {
            $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_AUTHORIZE, $exception->getStep());
            self::assertLessThanOrEqual(MatrixSignInRelay::MAX_HOPS + 1, count($this->requests));
        }
    }

    public function testAGuildAuthorizeErrorIsReportedWithItsOauthError(): void
    {
        $relay = $this->relay($this->happyPathScript(), kernelResponse: new Response(
            json_encode(['error' => 'access_denied', 'hint' => 'This player is not an approved member of this guild']),
            401
        ));

        try {
            $relay->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_GUILD_AUTHORIZE, $exception->getStep());
            self::assertStringContainsString('access_denied: This player is not an approved member', $exception->getMessage());
        }
    }

    public function testATokenEndpointFailureIsReportedWithoutTheBody(): void
    {
        $script = $this->happyPathScript();
        $script['POST /oauth2/token'] = fn () => new MockResponse(
            json_encode(['error' => 'invalid_grant', 'error_description' => 'secret stuff']),
            ['http_code' => 400]
        );

        try {
            $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_TOKEN, $exception->getStep());
            self::assertSame('MAS token endpoint answered 400 (invalid_grant)', $exception->getMessage());
        }
    }

    public function testAnotherAccountOnWhoamiIsRefused(): void
    {
        $script = $this->happyPathScript();
        $script['GET /_matrix/client/v3/account/whoami'] = fn () => new MockResponse(
            json_encode(['user_id' => '@someone-else:' . self::SERVER_NAME, 'device_id' => self::DEVICE_ID]),
            ['http_code' => 200]
        );

        try {
            $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);
            self::fail('Expected the relay to stop');
        } catch (MatrixSignInException $exception) {
            self::assertSame(MatrixSignInException::STEP_WHOAMI, $exception->getStep());
            self::assertStringContainsString('@someone-else', $exception->getMessage());
        }
    }

    public function testFallsBackToConventionalEndpointsWithoutDiscovery(): void
    {
        $script = $this->happyPathScript();
        $script['GET /.well-known/openid-configuration'] = fn () => new MockResponse('', ['http_code' => 500]);

        $session = $this->relay($script)->signIn(self::PLAYER_ID, self::GUILD_ID, self::DEVICE_ID);

        self::assertSame(self::MAS . '/oauth2/token', $session->tokenEndpoint);
        self::assertSame(self::MAS . '/oauth2/revoke', $session->revocationEndpoint);
    }

    /**
     * A scripted MAS, keyed by "METHOD /path". Each entry builds the response
     * for that hop; later tests override single hops to introduce faults.
     *
     * @return array<string, callable(array{method: string, url: string, headers: string[], body: string}): MockResponse>
     */
    private function happyPathScript(): array
    {
        return [
            'GET /.well-known/openid-configuration' => fn () => new MockResponse(json_encode([
                'issuer'                 => self::MAS,
                'authorization_endpoint' => self::MAS . '/authorize',
                'token_endpoint'         => self::MAS . '/oauth2/token',
                'revocation_endpoint'    => self::MAS . '/oauth2/revoke',
                'registration_endpoint'  => self::MAS . '/oauth2/registration',
            ]), ['http_code' => 200]),

            'GET /authorize' => function (array $request) {
                parse_str((string) parse_url($request['url'], PHP_URL_QUERY), $query);
                $this->authorizeState = $query['state'];
                $this->codeChallenge = $query['code_challenge'];

                return new MockResponse('', [
                    'http_code'        => 302,
                    'response_headers' => [
                        'Location'   => '/login?next=' . rawurlencode('/authorize/continue'),
                        'Set-Cookie' => 'mas_session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax',
                    ],
                ]);
            },

            // The login page: a password form MAS would also render, plus the
            // link to the upstream provider that must be taken instead.
            'GET /login' => fn () => new MockResponse(
                '<html><head><title>Sign in</title></head><body>'
                . '<form method="post" action="/login"><input name="csrf" type="hidden" value="x">'
                . '<input name="username"><input name="password" type="password"><button type="submit">Sign in</button></form>'
                . '<a href="/upstream/authorize/01?next=%2Fauthorize%2Fcontinue">Continue with Structs</a>'
                . '</body></html>',
                ['http_code' => 200, 'response_headers' => ['Content-Type' => 'text/html; charset=utf-8']]
            ),

            'GET /upstream/authorize/01' => fn () => $this->redirect(
                self::GUILD . '/oauth/authorize?' . http_build_query([
                    'response_type'         => 'code',
                    'client_id'             => 'mas',
                    'redirect_uri'          => self::MAS . '/upstream/callback/01',
                    'scope'                 => 'openid profile',
                    'state'                 => 'mas-upstream-state',
                    'nonce'                 => 'n',
                    'code_challenge'        => 'c',
                    'code_challenge_method' => 'S256',
                ])
            ),

            'GET /upstream/callback/01' => fn () => $this->redirect('/consent/xyz'),

            'GET /consent/xyz' => fn () => new MockResponse(
                '<html><head><title>Allow access?</title></head><body>'
                . '<form method="POST">'
                . '<input type="hidden" name="csrf" value="csrf-token-value">'
                . '<button type="submit" name="action" value="deny">Deny</button>'
                . '<button type="submit" name="action" value="allow">Allow</button>'
                . '</form></body></html>',
                ['http_code' => 200, 'response_headers' => ['Content-Type' => 'text/html']]
            ),

            'POST /consent/xyz' => fn () => $this->redirect(self::LOOPBACK . '?code=AUTHCODE&state=' . $this->authorizeState),

            'POST /oauth2/token' => fn () => new MockResponse(json_encode([
                'access_token'  => 'mat_access',
                'refresh_token' => 'mar_refresh',
                'token_type'    => 'Bearer',
                'expires_in'    => 300,
                'scope'         => MatrixSignInRelay::SCOPE_CLIENT_API,
            ]), ['http_code' => 200]),

            'GET /_matrix/client/v3/account/whoami' => fn () => new MockResponse(json_encode([
                'user_id'   => '@' . self::PLAYER_ID . ':' . self::SERVER_NAME,
                'device_id' => self::DEVICE_ID,
            ]), ['http_code' => 200]),
        ];
    }

    /**
     * @param array<string, callable> $script
     */
    private function relay(array $script, bool $parkFirst = false, ?Response $kernelResponse = null): MatrixSignInRelay
    {
        $this->requests = [];
        $this->kernelRequests = [];

        $httpClient = new MockHttpClient(function (string $method, string $url, array $options) use ($script): MockResponse {
            $record = [
                'method'  => $method,
                'url'     => $url,
                'headers' => $options['headers'] ?? [],
                'body'    => is_string($options['body'] ?? null) ? $options['body'] : '',
            ];
            $this->requests[] = $record;

            $key = $method . ' ' . $this->pathOf($url);

            if (!isset($script[$key])) {
                return new MockResponse('unscripted ' . $key, ['http_code' => 599]);
            }

            return $script[$key]($record);
        });

        $kernel = $this->createStub(HttpKernelInterface::class);
        $kernel->method('handle')->willReturnCallback(function (Request $request) use ($parkFirst, $kernelResponse): Response {
            $this->kernelRequests[] = $request;

            if ($kernelResponse !== null) {
                return $kernelResponse;
            }

            if ($parkFirst && count($this->kernelRequests) === 1) {
                return new RedirectResponse('/?oidc=parked-1');
            }

            return new RedirectResponse(self::MAS . '/upstream/callback/01?code=UPSTREAMCODE&state=mas-upstream-state');
        });

        $oidcConfig = new OidcConfig(
            true,
            self::GUILD,
            'mas',
            'secret',
            self::MAS . '/upstream/callback/01',
            '/nonexistent/private.key',
            '/nonexistent/public.key',
            'k',
            'a-thirty-two-byte-test-encryption',
            '/nonexistent'
        );

        $config = new MatrixSignInConfig($oidcConfig, self::MAS, self::CLIENT_ID, self::LOOPBACK, self::SERVER_NAME, self::HOMESERVER);

        return new MatrixSignInRelay($httpClient, $kernel, $config, new MasEndpoints($httpClient, new ArrayAdapter()));
    }

    private function redirect(string $location): MockResponse
    {
        return new MockResponse('', ['http_code' => 302, 'response_headers' => ['Location' => $location]]);
    }

    private function pathOf(string $url): string
    {
        return (string) parse_url($url, PHP_URL_PATH);
    }

    /**
     * @param array{headers: string[]} $request
     */
    private function cookieHeader(array $request): string
    {
        foreach ($request['headers'] as $header) {
            if (stripos($header, 'cookie:') === 0) {
                return trim(substr($header, 7));
            }
        }

        return '';
    }
}
