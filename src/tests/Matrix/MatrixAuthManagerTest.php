<?php declare(strict_types=1);

namespace App\Tests\Matrix;

use App\Constant\RegexPattern;
use App\Entity\PlayerAddress;
use App\Manager\ApiRequestParsingManager;
use App\Manager\MatrixAuthManager;
use App\Manager\OidcClaimsManager;
use App\Manager\SignatureValidationManager;
use App\Matrix\MatrixSession;
use App\Matrix\MatrixSignInConfig;
use App\Matrix\MatrixSignInException;
use App\Matrix\MatrixSignInRelay;
use App\Matrix\SignInRateLimiter;
use App\Matrix\UsedSignatureRegistry;
use App\Oidc\LoginContinuePolicy;
use App\Repository\PlayerAddressRepository;
use App\Util\ConstraintViolationUtil;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\NullLogger;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * The checks in front of the relay, in the order the client was promised, and
 * the error each one produces.
 */
class MatrixAuthManagerTest extends KernelTestCase
{
    private const string PLAYER_ID = '1-42';

    private const string MAS = 'https://auth.guild.test';

    private bool $configured = true;

    private bool $signatureValid = true;

    private bool $guildServedHere = true;

    private bool $addressApproved = true;

    private bool $playerEligible = true;

    private ?MatrixSignInException $relayFailure = null;

    /**
     * @var array<int, array{string, string, string}> player id, guild id, device id handed to the relay
     */
    private array $relayCalls = [];

    private ArrayAdapter $cache;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cache = new ArrayAdapter();
    }

    public function testASignedLoginReturnsAMatrixSession(): void
    {
        $response = $this->manager()->signIn($this->request($this->fields()));
        $body = json_decode($response->getContent(), true);

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertTrue($body['success']);
        self::assertSame([], $body['errors']);
        self::assertSame('@1-42:matrix.guild.test', $body['data']['user_id']);
        self::assertSame('K3J9QX2M7A', $body['data']['device_id']);
        self::assertSame('mat_access', $body['data']['access_token']);
        self::assertSame('mar_refresh', $body['data']['refresh_token']);
        self::assertSame(300, $body['data']['expires_in']);
        self::assertSame('public-client-01', $body['data']['client_id']);
        self::assertSame(self::MAS . '/oauth2/token', $body['data']['token_endpoint']);
        self::assertSame(self::MAS . '/oauth2/revoke', $body['data']['revocation_endpoint']);
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));

        self::assertSame([[self::PLAYER_ID, '0-1', 'K3J9QX2M7A']], $this->relayCalls);
    }

    public function testADeviceIdIsGeneratedWhenTheClientHasNone(): void
    {
        $response = $this->manager()->signIn($this->request($this->fields(['device_id' => null])));

        self::assertSame(Response::HTTP_OK, $response->getStatusCode());
        self::assertMatchesRegularExpression(RegexPattern::DEVICE_ID, $this->relayCalls[0][2]);
    }

    public function testNotConfiguredAnswers503BeforeLookingAtTheBody(): void
    {
        $this->configured = false;

        $response = $this->manager()->signIn($this->request('garbage'));

        self::assertSame(Response::HTTP_SERVICE_UNAVAILABLE, $response->getStatusCode());
        self::assertArrayHasKey('matrix_not_configured', $this->errors($response));
    }

    /**
     * @dataProvider badFieldProvider
     */
    public function testAMissingOrInvalidFieldIs400(mixed $body, string $expectedErrorFragment): void
    {
        $response = $this->manager()->signIn($this->request($body));

        self::assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        self::assertStringContainsString($expectedErrorFragment, json_encode($this->errors($response)));
        self::assertSame([], $this->relayCalls);
    }

    public function badFieldProvider(): array
    {
        return [
            'not json'          => ['garbage', 'invalid_request_content'],
            'missing address'   => [$this->fields(['address' => null]), 'address_required'],
            'bad device id'     => [$this->fields(['device_id' => 'no!']), 'device_id'],
            'short device id'   => [$this->fields(['device_id' => 'abc']), 'device_id'],
        ];
    }

    public function testAnExpiredTimestampIs401(): void
    {
        $response = $this->manager()->signIn($this->request($this->fields([
            'unix_timestamp' => (string) (time() - SignatureValidationManager::MSG_EXPIRY_TIME * 2),
        ])));

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertArrayHasKey('timestamp_expired', $this->errors($response));
    }

    public function testABadSignatureIs401(): void
    {
        $this->signatureValid = false;

        $response = $this->manager()->signIn($this->request($this->fields()));

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertArrayHasKey('signature_validation_failed', $this->errors($response));
        self::assertSame([], $this->relayCalls);
    }

    public function testAGuildWhoseMatrixIsNotServedHereIs403(): void
    {
        $this->guildServedHere = false;

        $response = $this->manager()->signIn($this->request($this->fields()));

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        self::assertArrayHasKey('not_guild_member', $this->errors($response));
    }

    public function testAnUnapprovedAddressIs403(): void
    {
        $this->addressApproved = false;

        $response = $this->manager()->signIn($this->request($this->fields()));

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        self::assertArrayHasKey('not_guild_member', $this->errors($response));
    }

    public function testAnIneligiblePlayerIs403(): void
    {
        $this->playerEligible = false;

        $response = $this->manager()->signIn($this->request($this->fields()));

        self::assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        self::assertArrayHasKey('not_guild_member', $this->errors($response));
    }

    public function testAReusedSignatureIs401(): void
    {
        $manager = $this->manager();

        self::assertSame(Response::HTTP_OK, $manager->signIn($this->request($this->fields()))->getStatusCode());

        $response = $manager->signIn($this->request($this->fields()));

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertArrayHasKey('signature_reused', $this->errors($response));
        self::assertCount(1, $this->relayCalls, 'The second attempt must not reach MAS');
    }

    public function testAFailedAttemptDoesNotBurnTheSignature(): void
    {
        $this->signatureValid = false;
        $manager = $this->manager();
        $manager->signIn($this->request($this->fields()));

        $this->signatureValid = true;

        self::assertSame(Response::HTTP_OK, $this->manager()->signIn($this->request($this->fields()))->getStatusCode());
    }

    public function testARelayFailureIs502NamingTheStep(): void
    {
        $this->relayFailure = new MatrixSignInException(MatrixSignInException::STEP_TOKEN, 'MAS token endpoint answered 500');

        $response = $this->manager()->signIn($this->request($this->fields()));

        self::assertSame(Response::HTTP_BAD_GATEWAY, $response->getStatusCode());
        self::assertSame(
            ['matrix_unavailable' => 'MAS or the homeserver failed at step: token'],
            $this->errors($response)
        );
        self::assertStringContainsString('no-store', (string) $response->headers->get('Cache-Control'));
    }

    public function testTooManyAttemptsFromOneAddressIs429(): void
    {
        $manager = $this->manager();

        for ($i = 0; $i < SignInRateLimiter::ADDRESS_LIMIT; $i++) {
            $manager->signIn($this->request($this->fields(['signature' => 'sig' . $i])));
        }

        $response = $manager->signIn($this->request($this->fields(['signature' => 'sigfinal'])));

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $response->getStatusCode());
        self::assertArrayHasKey('rate_limited', $this->errors($response));
        self::assertGreaterThan(0, (int) $response->headers->get('Retry-After'));
        self::assertCount(SignInRateLimiter::ADDRESS_LIMIT, $this->relayCalls);
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function fields(array $overrides = []): array
    {
        $fields = array_merge([
            'address'        => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
            'pubkey'         => '036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222',
            'signature'      => '6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a0360',
            'guild_id'       => '0-1',
            'unix_timestamp' => (string) time(),
            'device_id'      => 'K3J9QX2M7A',
        ], $overrides);

        return array_filter($fields, static fn ($value) => $value !== null);
    }

    private function request(mixed $body): Request
    {
        $request = Request::create(
            '/api/auth/matrix',
            'POST',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '203.0.113.7'],
            is_string($body) ? $body : json_encode($body)
        );

        return $request;
    }

    /**
     * @return array<string, string>
     */
    private function errors(Response $response): array
    {
        return json_decode($response->getContent(), true)['errors'];
    }

    private function manager(): MatrixAuthManager
    {
        self::bootKernel();
        $validator = static::getContainer()->get(ValidatorInterface::class);

        $config = $this->createStub(MatrixSignInConfig::class);
        $config->method('isConfigured')->willReturn($this->configured);
        $config->method('getMasIssuer')->willReturn(self::MAS);

        $signatureClient = new MockHttpClient(fn () => new MockResponse(json_encode(['valid' => $this->signatureValid])));

        $playerAddress = $this->createStub(PlayerAddress::class);
        $playerAddress->method('getPlayerId')->willReturn(self::PLAYER_ID);

        $playerAddressRepository = $this->createStub(PlayerAddressRepository::class);
        $playerAddressRepository->method('findOneBy')->willReturnCallback(fn () => $this->addressApproved ? $playerAddress : null);

        $entityManager = $this->createStub(EntityManagerInterface::class);
        $entityManager->method('getRepository')->willReturn($playerAddressRepository);

        $claims = $this->createStub(OidcClaimsManager::class);
        $claims->method('findEligiblePlayer')->willReturnCallback(
            fn () => $this->playerEligible ? ['id' => self::PLAYER_ID, 'guild_id' => '0-1'] : null
        );

        $policy = $this->createStub(LoginContinuePolicy::class);
        $policy->method('isAllowed')->willReturnCallback(fn () => $this->guildServedHere);

        $relay = $this->createStub(MatrixSignInRelay::class);
        $relay->method('signIn')->willReturnCallback(function (string $playerId, string $guildId, string $deviceId): MatrixSession {
            $this->relayCalls[] = [$playerId, $guildId, $deviceId];

            if ($this->relayFailure !== null) {
                throw $this->relayFailure;
            }

            return new MatrixSession(
                '@1-42:matrix.guild.test',
                $deviceId,
                'mat_access',
                'mar_refresh',
                300,
                'public-client-01',
                self::MAS . '/oauth2/token',
                self::MAS . '/oauth2/revoke'
            );
        });

        return new MatrixAuthManager(
            $config,
            new ApiRequestParsingManager($validator, new ConstraintViolationUtil()),
            new SignatureValidationManager($signatureClient),
            $entityManager,
            $claims,
            $policy,
            new SignInRateLimiter($this->cache),
            new UsedSignatureRegistry($this->cache),
            $relay,
            new NullLogger()
        );
    }
}
