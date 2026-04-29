<?php

use App\Manager\PlayerManager;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerTest extends KernelTestCase
{
    /**
     * @dataProvider raidSearchProvider
     * @param string $requestQueryString
     * @param array $expectedQueryParams
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @return void
     * @throws \Doctrine\DBAL\Exception
     */
    public function testRaidSearch(
        string $requestQueryString,
        array $expectedQueryParams,
        int $expectedHttpStatusCode,
        int $expectedErrorCount
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($expectedErrorCount > 0 ? 0 : 1))
            ->method('fetchAllAssociative')
            ->with($this->anything(), $expectedQueryParams)
            ->willReturn([]);

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $manager = new PlayerManager(
            $entityManagerStub,
            $container->get(ValidatorInterface::class),
        );

        $request = Request::create('/api/player/raid/search' . $requestQueryString);
        $session = new Session(new MockArraySessionStorage());
        $session->set('player_id', '1-218');
        $request->setSession($session);
        $response = $manager->raidSearch($request);

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
    }

    public function raidSearchProvider(): array
    {
        return [
            'Valid No Query Params' => [
                '',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0'
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Min Ore' => [
                '?min_ore=4',
                [
                    'player_id' => '1-218',
                    'min_ore' => '4'
                ],
                Response::HTTP_OK,
                0
            ],
            'Invalid Min Ore' => [
                '?min_ore=hello',
                [],
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'Valid Guild ID' => [
                '?guild_id=0-2',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0',
                    'guild_id' => '0-2'
                ],
                Response::HTTP_OK,
                0
            ],
            'Invalid Guild ID' => [
                '?guild_id=!0-2',
                [],
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'Valid Fleet Away' => [
                '?fleet_away_only=1',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0'
                ],
                Response::HTTP_OK,
                0
            ],
            'Invalid Fleet Away' => [
                '?fleet_away_only=9',
                [],
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'Valid Search String Player ID' => [
                '?search_string=1-13',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0',
                    'search_string' => '1-13',
                    'like_search_string' => '%1-13%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Search String Username' => [
                '?search_string=Zero-C00l',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0',
                    'search_string' => 'Zero-C00l',
                    'like_search_string' => '%Zero-C00l%',
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Search String Address' => [
                '?search_string=structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0',
                    'search_string' => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn',
                    'like_search_string' => '%structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Search String Filtering' => [
                '?search_string=Zero C00l!',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0',
                    'search_string' => 'ZeroC00l',
                    'like_search_string' => '%ZeroC00l%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Empty Search String' => [
                '?search_string=',
                [
                    'player_id' => '1-218',
                    'min_ore' => '0'
                ],
                Response::HTTP_OK,
                0
            ],
            'All Query Params' => [
                '?min_ore=5&guild_id=0-1&search_string=Ac1d Burn',
                [
                    'player_id' => '1-218',
                    'min_ore' => '5',
                    'guild_id' => '0-1',
                    'search_string' => 'Ac1dBurn',
                    'like_search_string' => '%Ac1dBurn%'
                ],
                Response::HTTP_OK,
                0
            ]
        ];
    }

    /**
     * @dataProvider transferSearchProvider
     * @param string $requestQueryString
     * @param array $expectedQueryParams
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @return void
     * @throws \Doctrine\DBAL\Exception
     */
    public function testTransferSearch(
        string $requestQueryString,
        array $expectedQueryParams,
        int $expectedHttpStatusCode,
        int $expectedErrorCount
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($expectedErrorCount > 0 ? 0 : 1))
            ->method('fetchAllAssociative')
            ->with($this->anything(), $expectedQueryParams)
            ->willReturn([]);

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $manager = new PlayerManager(
            $entityManagerStub,
            $container->get(ValidatorInterface::class),
        );

        $request = Request::create('/api/player/transfer/search' . $requestQueryString);
        $response = $manager->transferSearch($request);

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
    }

    public function transferSearchProvider(): array
    {
        return [
            'No Query Params' => [
                '',
                [],
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'Missing search string' => [
                '?guild_id=1-13',
                [],
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'Valid Search String Player ID' => [
                '?search_string=1-13',
                [
                    'like_search_string' => '%1-13%',
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Search String Address' => [
                '?search_string=structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn',
                [
                    'like_search_string' => '%structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Search String Username' => [
                '?search_string=Zero C00l!',
                [
                    'like_search_string' => '%ZeroC00l%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Invalid Guild Id' => [
                '?guild_id=!0-1&search_string=Ac1d Burn',
                [],
                Response::HTTP_BAD_REQUEST,
                1
            ],
            'Valid All Query Params' => [
                '?guild_id=0-1&search_string=Ac1d Burn',
                [
                    'guild_id' => '0-1',
                    'like_search_string' => '%Ac1dBurn%'
                ],
                Response::HTTP_OK,
                0
            ]
        ];
    }
}