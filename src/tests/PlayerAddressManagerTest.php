<?php

namespace App\Tests;

use App\Entity\PlayerAddress;
use App\Entity\PlayerAddressPending;
use App\Factory\PlayerAddressPendingFactory;
use App\Manager\PlayerAddressManager;
use App\Manager\SignatureValidationManager;
use App\Repository\PlayerAddressPendingRepository;
use App\Repository\PlayerAddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class PlayerAddressManagerTest extends KernelTestCase
{
    /**
     * @dataProvider getPlayerIdByAddressAndGuildProvider
     * @param string $address
     * @param string $guild_id
     * @param bool $playerAddressExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     */
    public function testGetPlayerIdByAddressAndGuild(
        string $address,
        string $guild_id,
        bool   $playerAddressExists,
        int    $expectedHttpStatusCode,
        int    $expectedErrorCount,
        mixed $expectedData
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $playerAddressStub = $this->createStub(PlayerAddress::class);
        $playerAddressStub->method('getPlayerId')
            ->willReturn('1-1');

        $playerAddressRepository = $this->createStub(PlayerAddressRepository::class);
        $playerAddressRepository->method('findApprovedByAddressAndGuild')
            ->willReturn($playerAddressExists
                ? $playerAddressStub
                : null
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getRepository')
            ->willReturnMap([
                [PlayerAddress::class, $playerAddressRepository]
            ]);

        $validator = $container->get(ValidatorInterface::class);

        $playerManager = new PlayerAddressManager(
            $entityManagerStub,
            $validator
        );
        $response = $playerManager->getPlayerIdByAddressAndGuild($address, $guild_id);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function getPlayerIdByAddressAndGuildProvider() : array
    {
        return [
            'bad address'  => [
                '!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                '0-1',
                false,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'bad guild_id'  => [
                'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                '!0-1',
                false,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'valid'  => [
                "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                "0-1",
                true,
                Response::HTTP_OK,
                0,
                ['player_id' => '1-1']
            ]
        ];
    }

    /**
     * @dataProvider addPendingAddressProvider
     * @param mixed $requestContent
     * @param bool $isSignatureValid
     * @param bool $playerAddressPendingExists
     * @param bool $playerAddressExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @return void
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function testAddPendingAddress(
        mixed $requestContent,
        bool  $isSignatureValid,
        bool  $playerAddressPendingExists,
        bool  $playerAddressExists,
        int   $expectedHttpStatusCode,
        int   $expectedErrorCount
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $playerAddressPendingRepositoryStub = $this->createStub(PlayerAddressPendingRepository::class);
        $playerAddressPendingRepositoryStub->method('find')
            ->willReturn($playerAddressPendingExists
                ? $this->createStub(PlayerAddressPending::class)
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
                [PlayerAddressPending::class, $playerAddressPendingRepositoryStub],
                [PlayerAddress::class, $playerAddressRepositoryStub]
            ]);

        $validator = $container->get(ValidatorInterface::class);
        $playerAddressPendingFactory = new PlayerAddressPendingFactory();
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

        $playerAddressManager = new PlayerAddressManager(
            $entityManagerStub,
            $validator
        );
        $request = Request::create('/api/player-address', 'POST', [], [], [] ,[], json_encode($requestContent));
        $response = $playerAddressManager->addPendingAddress($request, $playerAddressPendingFactory, $signatureValidationManager);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
    }

    public function addPendingAddressProvider(): array
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
                    "address" => "!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "!036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "!ZBS6UEC24Z",
                    "ip" => "!127.0.0.1",
                    "user_agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
                ],
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                4
            ],
            'missing required field' => [
                [
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "ZBS6UEC24Z",
                    "ip" => "127.0.0.1",
                    "user_agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
                ],
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'invalid signature'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "r6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "ZBS6UEC24Z",
                    "ip" => "127.0.0.1",
                    "user_agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
                ],
                false,
                false,
                false,
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'player address pending already exists'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "ZBS6UEC24Z",
                    "ip" => "127.0.0.1",
                    "user_agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
                ],
                true,
                true,
                false,
                Response::HTTP_CONFLICT,
                1
            ],
            'pending address already exists'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "ZBS6UEC24Z",
                    "ip" => "127.0.0.1",
                    "user_agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
                ],
                true,
                false,
                true,
                Response::HTTP_CONFLICT,
                1
            ],
            'valid'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "ZBS6UEC24Z",
                    "ip" => "127.0.0.1",
                    "user_agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
                ],
                true,
                false,
                false,
                Response::HTTP_ACCEPTED,
                0
            ],
            'valid without option fields'  => [
                [
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                    "signature" => "6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601",
                    "pubkey" => "036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222",
                    "guild_id" => "0-1",
                    "code" => "ZBS6UEC24Z"
                ],
                true,
                false,
                false,
                Response::HTTP_ACCEPTED,
                0
            ],
        ];
    }
}