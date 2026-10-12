<?php declare(strict_types=1);

use App\Entity\Player;
use App\Entity\PlayerAddress;
use App\Entity\PlayerPending;
use App\Factory\PlayerPendingFactory;
use App\Manager\AuthManager;
use App\Manager\SignatureValidationManager;
use App\Oidc\LoginContinuePolicy;
use App\Repository\PlayerAddressRepository;
use App\Repository\PlayerPendingRepository;
use App\Repository\PlayerRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class AuthManagerTest extends KernelTestCase
{
    private const string LOGIN_PLAYER_ID = '1-42';

    /**
     * @dataProvider signupProvider
     * @param mixed $requestContent
     * @param bool $isSignatureValid
     * @param bool $playerPendingExists
     * @param bool $playerAddressExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @return void
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function testSignup(
        mixed $requestContent,
        bool  $isSignatureValid,
        bool  $playerPendingExists,
        bool  $playerAddressExists,
        int   $expectedHttpStatusCode,
        int   $expectedErrorCount
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $playerPendingRepositoryStub = $this->createStub(PlayerPendingRepository::class);
        $playerPendingRepositoryStub->method('find')
            ->willReturn($playerPendingExists
                ? $this->createStub(PlayerPending::class)
                : null
            );

        $playerAddressRepositoryStub = $this->createStub(PlayerAddressRepository::class);
        $playerAddressRepositoryStub->method('findApprovedByAddressAndGuild')
            ->willReturn($playerAddressExists
                ? $this->createStub(PlayerAddress::class)
                : null
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getRepository')
            ->willReturnMap([
                [PlayerPending::class, $playerPendingRepositoryStub],
                [PlayerAddress::class, $playerAddressRepositoryStub]
            ]);

        $validator = $container->get(ValidatorInterface::class);
        $playerPendingFactory = new PlayerPendingFactory();
        $validateSignatureResponseBody = json_encode([
            'pubkeyFormatError' => false,
            'signatureFormatError' => false,
            'addressPubkeyMismatch' => false,
            'signatureInvalid' => false,
            'valid' => $isSignatureValid
        ]);
        $responses = [new MockResponse($validateSignatureResponseBody),];
        $httpClient = new MockHttpClient($responses);
        $signatureValidationManager = new SignatureValidationManager($httpClient);

        $authManager = new AuthManager(
            $validator,
            $entityManagerStub,
            $signatureValidationManager
        );
        $request = Request::create('/api/auth/signup', 'POST', [], [], [] ,[], json_encode($requestContent));
        $response = $authManager->signup($request, $playerPendingFactory);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
    }

    public function signupProvider(): array
    {
        return [
            'no request content'  => [
                null,
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'invalid request content' => [
                'hello',
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'constraint violations' => [
                [
                    "primary_address" => "!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "!036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "username" => "Test User",
                    "pfp" => "!{}"
                ],
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                4
            ],
            'missing field' => [
                [
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "username" => "TestUser",
                    "pfp" => "{}"
                ],
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'invalid signature'  => [
                [
                    "primary_address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "username" => "TestUser",
                    "pfp" => "{}"
                ],
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'pending player already exists'  => [
                [
                    "primary_address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "username" => "TestUser",
                    "pfp" => "{}"
                ],
                true,
                true,
                false,
                Response::HTTP_CONFLICT,
                1
            ],
            'pending address already exists'  => [
                [
                    "primary_address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "username" => "TestUser",
                    "pfp" => "{}"
                ],
                true,
                false,
                true,
                Response::HTTP_CONFLICT,
                1
            ],
            'valid'  => [
                [
                    "primary_address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "username" => "TestUser",
                    "pfp" => "{}"
                ],
                true,
                false,
                false,
                Response::HTTP_ACCEPTED,
                0
            ]
        ];
    }

    /**
     * @dataProvider loginProvider
     * @param mixed $requestContent
     * @param bool $isSignatureValid
     * @param bool $playerAddressExists
     * @param bool $playerExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @return void
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function testLogin(
        mixed $requestContent,
        bool $isSignatureValid,
        bool $playerAddressExists,
        bool $playerExists,
        int $expectedHttpStatusCode,
        int $expectedErrorCount
    ): void
    {
        $authManager = $this->buildLoginAuthManager($isSignatureValid, $playerAddressExists, $playerExists);

        $request = Request::create('/api/auth/login', 'POST', [], [], [] ,[], json_encode($requestContent));
        $request->setSession($this->createStub(SessionInterface::class));
        $response = $authManager->login($request, $this->securityStub());
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
    }

    /**
     * The Matrix login popup posts an HTML form rather than JSON, because the
     * session cookie has to be set by a top-level navigation in the guild's own
     * window. The fields and the signature check are the same either way.
     */
    public function testLoginAcceptsAFormPostWithTheSameFields(): void
    {
        $authManager = $this->buildLoginAuthManager(true, true, true);
        $session = new Session(new MockArraySessionStorage());

        $request = Request::create('/api/auth/login', 'POST', $this->validLoginFields());
        $request->setSession($session);

        $response = $authManager->login($request, $this->securityStub());
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertTrue($responseContent['success']);
        $this->assertSame(self::LOGIN_PLAYER_ID, $session->get('player_id'));
        $this->assertSame('0-1', $session->get('guild_id'));
    }

    public function testFormLoginWithAnAllowedContinueSetsTheSessionAndRedirects(): void
    {
        $continue = 'https://auth.guild.test/authorize?client_id=mas&state=abc';
        $authManager = $this->buildLoginAuthManager(true, true, true, $this->continuePolicy(true));
        $session = new Session(new MockArraySessionStorage());

        $request = Request::create('/api/auth/login', 'POST', $this->validLoginFields(['continue' => $continue]));
        $request->setSession($session);

        $response = $authManager->login($request, $this->securityStub());

        $this->assertInstanceOf(RedirectResponse::class, $response);
        $this->assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertSame($continue, $response->headers->get('Location'));
        $this->assertSame(self::LOGIN_PLAYER_ID, $session->get('player_id'), 'The session must be established before redirecting');
        $this->assertSame('0-1', $session->get('guild_id'));
    }

    public function testFormLoginWithADisallowedContinueIsRefusedBeforeLoggingIn(): void
    {
        $authManager = $this->buildLoginAuthManager(true, true, true, $this->continuePolicy(false));
        $session = new Session(new MockArraySessionStorage());

        $security = $this->createMock(Security::class);
        $security->expects($this->never())->method('login');

        $request = Request::create(
            '/api/auth/login',
            'POST',
            $this->validLoginFields(['continue' => 'https://evil.example/phish'])
        );
        $request->setSession($session);

        $response = $authManager->login($request, $security);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertArrayHasKey('continue_not_allowed', $responseContent['errors']);
        $this->assertNull($session->get('player_id'), 'A refused redirect must not leave a session behind');
    }

    public function testContinueIsRefusedWhenNoPolicyIsConfigured(): void
    {
        $authManager = $this->buildLoginAuthManager(true, true, true, null);

        $request = Request::create(
            '/api/auth/login',
            'POST',
            $this->validLoginFields(['continue' => 'https://auth.guild.test/authorize'])
        );
        $request->setSession(new Session(new MockArraySessionStorage()));

        $response = $authManager->login($request, $this->securityStub());

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testAMalformedContinueIsAConstraintViolation(): void
    {
        $authManager = $this->buildLoginAuthManager(true, true, true, $this->continuePolicy(true));

        $request = Request::create(
            '/api/auth/login',
            'POST',
            $this->validLoginFields(['continue' => 'not a url'])
        );
        $request->setSession(new Session(new MockArraySessionStorage()));

        $response = $authManager->login($request, $this->securityStub());
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        $this->assertNotEmpty(array_filter(
            $responseContent['errors'],
            static fn (string $error): bool => str_starts_with($error, 'continue - ')
        ));
    }

    public function testAnEmptyContinueFieldBehavesAsIfAbsent(): void
    {
        $authManager = $this->buildLoginAuthManager(true, true, true, $this->continuePolicy(false));

        $request = Request::create('/api/auth/login', 'POST', $this->validLoginFields(['continue' => '']));
        $request->setSession(new Session(new MockArraySessionStorage()));

        $response = $authManager->login($request, $this->securityStub());

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
    }

    /**
     * A failed form login must answer with the usual JSON error, not a redirect,
     * so the caller can tell what went wrong and nothing is sent to `continue`
     * without a session behind it.
     */
    public function testFailedFormLoginReturnsJsonErrorEvenWithContinue(): void
    {
        $authManager = $this->buildLoginAuthManager(false, true, true, $this->continuePolicy(true));

        $request = Request::create(
            '/api/auth/login',
            'POST',
            $this->validLoginFields(['continue' => 'https://auth.guild.test/authorize'])
        );
        $request->setSession(new Session(new MockArraySessionStorage()));

        $response = $authManager->login($request, $this->securityStub());
        $responseContent = json_decode($response->getContent(), true);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        $this->assertArrayHasKey('signature_validation_failed', $responseContent['errors']);
    }

    public function testContinueIsHonouredInAJsonBodyToo(): void
    {
        $continue = 'https://auth.guild.test/authorize';
        $authManager = $this->buildLoginAuthManager(true, true, true, $this->continuePolicy(true));

        $request = Request::create(
            '/api/auth/login',
            'POST',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($this->validLoginFields(['continue' => $continue]))
        );
        $request->setSession(new Session(new MockArraySessionStorage()));

        $response = $authManager->login($request, $this->securityStub());

        $this->assertSame(Response::HTTP_FOUND, $response->getStatusCode());
        $this->assertSame($continue, $response->headers->get('Location'));
    }

    /**
     * @param array<string, string> $overrides
     *
     * @return array<string, string>
     */
    private function validLoginFields(array $overrides = []): array
    {
        return array_merge([
            'address' => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
            'signature' => '6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601',
            'pubkey' => '036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222',
            'guild_id' => '0-1',
            'unix_timestamp' => strval(time()),
        ], $overrides);
    }

    private function buildLoginAuthManager(
        bool $isSignatureValid,
        bool $playerAddressExists,
        bool $playerExists,
        ?LoginContinuePolicy $loginContinuePolicy = null
    ): AuthManager {
        self::bootKernel();
        $container = static::getContainer();

        $playerAddressStub = $this->createStub(PlayerAddress::class);
        $playerAddressStub->method('getPlayerId')->willReturn(self::LOGIN_PLAYER_ID);

        $playerAddressRepositoryStub = $this->createStub(PlayerAddressRepository::class);
        $playerAddressRepositoryStub->method('findOneBy')
            ->willReturn($playerAddressExists ? $playerAddressStub : null);

        $playerStub = $this->createStub(Player::class);
        $playerStub->method('getId')->willReturn(self::LOGIN_PLAYER_ID);

        $playerRepositoryStub = $this->createStub(PlayerRepository::class);
        $playerRepositoryStub->method('find')
            ->willReturn($playerExists ? $playerStub : null);

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getRepository')
            ->willReturnMap([
                [PlayerAddress::class, $playerAddressRepositoryStub],
                [Player::class, $playerRepositoryStub]
            ]);

        $validateSignatureResponseBody = json_encode([
            'pubkeyFormatError' => false,
            'signatureFormatError' => false,
            'addressPubkeyMismatch' => false,
            'signatureInvalid' => false,
            'valid' => $isSignatureValid
        ]);

        $httpClient = new MockHttpClient([new MockResponse($validateSignatureResponseBody)]);

        return new AuthManager(
            $container->get(ValidatorInterface::class),
            $entityManagerStub,
            new SignatureValidationManager($httpClient),
            $loginContinuePolicy
        );
    }

    private function securityStub(): Security
    {
        $securityStub = $this->createStub(Security::class);
        $securityStub->method('login')->willReturn(null);

        return $securityStub;
    }

    private function continuePolicy(bool $allowed): LoginContinuePolicy
    {
        $policy = $this->createStub(LoginContinuePolicy::class);
        $policy->method('isAllowed')->willReturn($allowed);

        return $policy;
    }

    public function loginProvider(): array
    {
        return [
            'no request content'  => [
                null,
                false,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                2
            ],
            'invalid request content' => [
                'hello',
                false,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                2
            ],
            'constraint violations' => [
                [
                    "address" => "!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "!036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "unix_timestamp" => "!1737660606"
                ],
                false,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                4
            ],
            'missing field' => [
                [
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                ],
                false,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                3
            ],
            'invalid signature'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "unix_timestamp" => strval(time())
                ],
                false,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                1
            ],
            'player address does not exist'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "unix_timestamp" => strval(time())
                ],
                true,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                1
            ],
            'player does not exist'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "unix_timestamp" => strval(time())
                ],
                true,
                true,
                false,
                Response::HTTP_UNAUTHORIZED,
                1
            ],
            'expired message timestamp'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "unix_timestamp" => strval(time() - (SignatureValidationManager::MSG_EXPIRY_TIME * 2))
                ],
                true,
                true,
                true,
                Response::HTTP_UNAUTHORIZED,
                1
            ],
            'valid'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "unix_timestamp" => strval(time())
                ],
                true,
                true,
                true,
                Response::HTTP_OK,
                0
            ]
        ];
    }
}