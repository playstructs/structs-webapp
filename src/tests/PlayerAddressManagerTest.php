<?php

namespace App\Tests;

use App\Entity\PlayerAddress;
use App\Entity\PlayerAddressPending;
use App\Factory\PlayerAddressPendingFactory;
use App\Manager\PlayerAddressManager;
use App\Manager\SignatureValidationManager;
use App\Repository\PlayerAddressPendingRepository;
use App\Repository\PlayerAddressRepository;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
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

        $playerAddressMock = $this->createMock(PlayerAddress::class);
        $playerAddressMock->method('get')
            ->with($this->equalTo('player_id'))
            ->willReturn('1-1');

        $playerAddressRepository = $this->createMock(PlayerAddressRepository::class);
        $playerAddressRepository->expects($this->exactly($expectedHttpStatusCode === Response::HTTP_BAD_REQUEST ? 0 : 1))
            ->method('findOneBy')
            ->with(['address' => $address, 'guild_id' => $guild_id, 'status' => 'approved'])
            ->willReturn($playerAddressExists
                ? $playerAddressMock
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
            'resource not found'  => [
                "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf",
                "0-1",
                false,
                Response::HTTP_NOT_FOUND,
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
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn",
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
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn",
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
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn",
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
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn",
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
                    "address" => "structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn",
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

    /**
     * @dataProvider getPendingAddressByCodeProvider
     * @param string $code
     * @param bool $playerAddressPendingExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     */
    public function testGetPendingAddressByCode(
        string $code,
        bool   $playerAddressPendingExists,
        int    $expectedHttpStatusCode,
        int    $expectedErrorCount,
        mixed $expectedData
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $playerAddressPending = new PlayerAddressPending();
        $playerAddressPending->setAddress('structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn');
        $playerAddressPending->setSignature('6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601');
        $playerAddressPending->setPubkey('036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222');
        $playerAddressPending->setCode($code);
        $playerAddressPending->setIp('127.0.0.1');
        $playerAddressPending->setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0');

        $playerAddressPendingRepository = $this->createMock(PlayerAddressPendingRepository::class);
        $playerAddressPendingRepository->expects($this->exactly($expectedHttpStatusCode === Response::HTTP_BAD_REQUEST ? 0 : 1))
            ->method('findOneBy')
            ->with(['code' => $code])
            ->willReturn($playerAddressPendingExists
                ? $playerAddressPending
                : null
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getRepository')
            ->willReturnMap([
                [PlayerAddressPending::class, $playerAddressPendingRepository]
            ]);

        $validator = $container->get(ValidatorInterface::class);

        $playerAddressManager = new PlayerAddressManager(
            $entityManagerStub,
            $validator
        );
        $response = $playerAddressManager->getPendingAddressByCode($code);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertEquals($expectedData, $responseContent['data']);
    }

    public function getPendingAddressByCodeProvider() : array
    {
        return [
            'bad code' => [
                '!#$#%#$%@$%',
                false,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'resource not found' => [
                "ZBS6UEC24Z",
                false,
                Response::HTTP_NOT_FOUND,
                1,
                null
            ],
            'valid' => [
                "ZBS6UEC24Z",
                true,
                Response::HTTP_OK,
                0,
                [
                    'address' => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn',
                    'signature' => '6a18392b839c16131a46b279eab627864cd6ad3e13d403ead65d799cd8a5a03608481e384e303823d8e74489310906ee0d0edee0c14c080bc2d63c4cc9cfca5601',
                    'pubkey' => '036ff73ae45ee6d4cf2dba7be689d6df30d1ec53f528fb520ce69b67e2515c6222',
                    'code' => 'ZBS6UEC24Z',
                    'ip' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0'
                ]
            ]
        ];
    }

    /**
     * @dataProvider countAddressesProvider
     * @param string $player_id
     * @param int $addressCount
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     * @throws Exception
     */
    public function testCountAddresses(
        string $player_id,
        int $addressCount,
        int $expectedHttpStatusCode,
        int $expectedErrorCount,
        mixed $expectedData
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($expectedErrorCount > 0 ? 0 : 1))
            ->method('fetchAssociative')
            ->with($this->anything(), ['player_id' => $player_id])
            ->willReturn(['count' => $addressCount]);

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $validator = $container->get(ValidatorInterface::class);

        $playerAddressManager = new PlayerAddressManager(
            $entityManagerStub,
            $validator
        );
        $response = $playerAddressManager->countPlayerAddresses($player_id);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function countAddressesProvider() : array
    {
        return [
            'bad player_id' => [
                '!#$#%#$%@$%',
                0,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'unknown player' => [
                "1-47634",
                0,
                Response::HTTP_OK,
                0,
                ['count' => 0]
            ],
            'valid player' => [
                "1-13",
                2,
                Response::HTTP_OK,
                0,
                ['count' => 2]
            ]
        ];
    }

    /**
     * @dataProvider getAddressListProvider
     * @param string $player_id
     * @param bool $playerExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     * @throws Exception
     */
    public function testGetAddressList(
        string $player_id,
        bool $playerExists,
        int $expectedHttpStatusCode,
        int $expectedErrorCount,
        mixed $expectedData
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($expectedErrorCount > 0 ? 0 : 1))
            ->method('fetchAllAssociative')
            ->with($this->anything(), ['player_id' => $player_id])
            ->willReturn($playerExists
                ? [[
                    'address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz',
                    'block_time' => '2024-12-24 01:13:01.484609+00',
                    'ip' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
                ]]
                : []
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $validator = $container->get(ValidatorInterface::class);

        $playerAddressManager = new PlayerAddressManager(
            $entityManagerStub,
            $validator
        );
        $response = $playerAddressManager->getAddressList($player_id);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function getAddressListProvider() : array
    {
        return [
            'bad player_id' => [
                '!#$#%#$%@$%',
                false,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'unknown player' => [
                "1-47634",
                false,
                Response::HTTP_OK,
                0,
                []
            ],
            'valid player' => [
                "1-13",
                true,
                Response::HTTP_OK,
                0,
                [[
                    'address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz',
                    'block_time' => '2024-12-24 01:13:01.484609+00',
                    'ip' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
                ]]
            ]
        ];
    }

    /**
     * @dataProvider getAddressDetailsProvider
     * @param string $address
     * @param bool $addressExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     * @throws Exception
     */
    public function testGetAddressDetails(
        string $address,
        bool $addressExists,
        int $expectedHttpStatusCode,
        int $expectedErrorCount,
        mixed $expectedData
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($expectedErrorCount > 0 ? 0 : 1))
            ->method('fetchAssociative')
            ->with($this->anything(), ['address' => $address])
            ->willReturn($addressExists
                ? [[
                    'ip' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
                    'permission_assets' => 'f',
                    'permissions' => 't',
                ]]
                : []
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $validator = $container->get(ValidatorInterface::class);

        $playerAddressManager = new PlayerAddressManager(
            $entityManagerStub,
            $validator
        );
        $response = $playerAddressManager->getAddressDetails($address);
        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function getAddressDetailsProvider() : array
    {
        return [
            'bad address' => [
                '!#$#%#$%@$%',
                false,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'unknown address' => [
                "structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjaaaaaa",
                false,
                Response::HTTP_OK,
                0,
                []
            ],
            'valid address' => [
                "structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz",
                true,
                Response::HTTP_OK,
                0,
                [[
                    'ip' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
                    'permission_assets' => 'f',
                    'permissions' => 't',
                ]]
            ]
        ];
    }
}