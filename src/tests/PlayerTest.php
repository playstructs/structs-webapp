<?php

use App\Manager\PlayerManager;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
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

        $request = Request::create('/api/raid/players' . $requestQueryString);
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
                    'min_ore' => '0'
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Min Ore' => [
                '?min_ore=4',
                [
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
                    'min_ore' => '0',
                    'search_string' => '%1-13%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Search String Username' => [
                '?search_string=Zero-C00l',
                [
                    'min_ore' => '0',
                    'search_string' => '%Zero-C00l%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Valid Search String Address' => [
                '?search_string=structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn',
                [
                    'min_ore' => '0',
                    'search_string' => '%structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Search String Filtering' => [
                '?search_string=Zero C00l!',
                [
                    'min_ore' => '0',
                    'search_string' => '%ZeroC00l%'
                ],
                Response::HTTP_OK,
                0
            ],
            'Empty Search String' => [
                '?search_string=',
                [
                    'min_ore' => '0'
                ],
                Response::HTTP_OK,
                0
            ],
            'All Query Params' => [
                '?min_ore=5&guild_id=0-1&search_string=Ac1d Burn',
                [
                    'min_ore' => '5',
                    'guild_id' => '0-1',
                    'search_string' => '%Ac1dBurn%'
                ],
                Response::HTTP_OK,
                0
            ]
        ];
    }

    /**
     * @dataProvider updateUsernameProvider
     * @param array $requestContent
     * @param bool $isStatementExecutionExpected
     * @param array $expectedQueryParams
     * @param int $rowsAffected
     * @param string|null $sessionPlayerId
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     * @throws \Doctrine\DBAL\Exception
     */
    public function testUpdateUsername(
        array $requestContent,
        bool $isStatementExecutionExpected,
        array $expectedQueryParams,
        int $rowsAffected,
        string|null $sessionPlayerId,
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
        $connectionMock->expects($this->exactly($isStatementExecutionExpected ? 1 : 0))
            ->method('executeStatement')
            ->with($this->anything(), $expectedQueryParams)
            ->willReturn($rowsAffected);

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $manager = new PlayerManager(
            $entityManagerStub,
            $container->get(ValidatorInterface::class),
        );

        $session = $this->createStub(SessionInterface::class);
        $session->method('get')
            ->willReturn($sessionPlayerId);

        $request = Request::create('/api/player/username', 'PUT', [], [], [] ,[], json_encode($requestContent));
        $request->setSession($session);

        $response = $manager->updateUsername($request);

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function updateUsernameProvider() : array
    {
        return [
//            'test case' => [
//                'requestContent',
//                'isStatementExecutionExpected',
//                'expectedQueryParams',
//                'rowsAffected',
//                'sessionPlayerId',
//                'expectedHttpStatusCode',
//                'expectedErrorCount',
//                'expectedData'
//            ],
            'missing username' => [
                [],
                false,
                [],
                0,
                '1-1',
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'bad username' => [
                ['username' => '!my new username'],
                false,
                [],
                0,
                '1-1',
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
            'missing session player_id' => [
                ['username' => 'my_new_username'],
                true,
                [
                    'player_id' => null,
                    'username' => 'my_new_username'
                ],
                0,
                null,
                Response::HTTP_INTERNAL_SERVER_ERROR,
                1,
                ['rows_affected' => 0]
            ],
            'valid' => [
                ['username' => 'my_new_username'],
                true,
                [
                    'player_id' => '1-1',
                    'username' => 'my_new_username'
                ],
                1,
                '1-1',
                Response::HTTP_OK,
                0,
                ['rows_affected' => 1]
            ]
        ];
    }
}