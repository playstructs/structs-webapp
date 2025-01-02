<?php declare(strict_types=1);

namespace App\Tests;

use App\Entity\Player;
use App\Entity\PlayerAddress;
use App\Entity\PlayerPending;
use App\Factory\PlayerPendingFactory;
use App\Manager\AuthManager;
use App\Manager\SignatureValidationManager;
use App\Repository\PlayerAddressRepository;
use App\Repository\PlayerPendingRepository;
use App\Repository\PlayerRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class AuthManagerTest extends KernelTestCase
{
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
        $playerAddressRepositoryStub->method('findOneBy')
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
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $playerAddressRepositoryStub = $this->createStub(PlayerAddressRepository::class);
        $playerAddressRepositoryStub->method('findOneBy')
            ->willReturn($playerAddressExists
                ? $this->createStub(PlayerAddress::class)
                : null
            );

        $playerRepositoryStub = $this->createStub(PlayerRepository::class);
        $playerRepositoryStub->method('find')
            ->willReturn($playerExists
                ? $this->createStub(Player::class)
                : null
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getRepository')
            ->willReturnMap([
                [PlayerAddress::class, $playerAddressRepositoryStub],
                [Player::class, $playerRepositoryStub]
            ]);

        $validator = $container->get(ValidatorInterface::class);

        $securityStub = $this->createStub(Security::class);
        $securityStub->method('login')
            ->willReturn(null);

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

        $request = Request::create('/api/auth/login', 'POST', [], [], [] ,[], json_encode($requestContent));
        $request->setSession($this->createStub(SessionInterface::class));
        $response = $authManager->login($request, $securityStub);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
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
                    "guild_id" => "0-1"
                ],
                false,
                false,
                false,
                Response::HTTP_UNAUTHORIZED,
                3
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
                2
            ],
            'invalid signature'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1"
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
                    "guild_id" => "0-1"
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
                    "guild_id" => "0-1"
                ],
                true,
                true,
                false,
                Response::HTTP_UNAUTHORIZED,
                1
            ],
            'valid'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1"
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