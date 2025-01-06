<?php

namespace App\Tests;

use App\Constant\ApiParameters;
use App\Manager\ApiRequestParsingManager;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ApiSqlQueryTraitTest extends KernelTestCase
{
    /**
     * @dataProvider queryOneProvider
     * @param array $requestParams
     * @param array $requiredFields
     * @param string $query
     * @param bool $isFetchExpected
     * @param bool $hasFetchResult
     * @param mixed $fetchResult
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     */
    public function testQueryOne(
        array $requestParams,
        array $requiredFields,
        string $query,
        bool $isFetchExpected,
        bool $hasFetchResult,
        mixed $fetchResult,
        int $expectedHttpStatusCode,
        int $expectedErrorCount,
        mixed $expectedData
    ) {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($isFetchExpected ? 1 : 0))
            ->method('fetchAssociative')
            ->with($query, $requestParams)
            ->willReturn($hasFetchResult
                ? $fetchResult
                : null
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $apiRequestParsingManager = new ApiRequestParsingManager(
            $container->get(ValidatorInterface::class),
            new ConstraintViolationUtil()
        );

        $trait = new class { use ApiSqlQueryTrait; };
        $response = $trait->queryOne(
            $entityManagerStub,
            $apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function queryOneProvider() : array
    {
        return [
            'valid' => [
                [ApiParameters::PLAYER_ID => "1-13", ApiParameters::GUILD_ID => "0-1"],
                [ApiParameters::PLAYER_ID, ApiParameters::GUILD_ID],
                'SELECT address FROM player_address WHERE player_id = :player_id AND guild_id = :guild_id',
                true,
                true,
                [
                    'address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz',
                ],
                Response::HTTP_OK,
                0,
                [
                    'address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz',
                ],
            ],
            'bad request params' => [
                [ApiParameters::PLAYER_ID => "!1-13", ApiParameters::GUILD_ID => "!0-1"],
                [ApiParameters::PLAYER_ID, ApiParameters::GUILD_ID],
                'SELECT address FROM player_address WHERE player_id = :player_id AND guild_id = :guild_id',
                false,
                false,
                null,
                Response::HTTP_BAD_REQUEST,
                2,
                null,
            ],
            'no matching records' => [
                [ApiParameters::PLAYER_ID => "1-13", ApiParameters::GUILD_ID => "0-1"],
                [ApiParameters::PLAYER_ID, ApiParameters::GUILD_ID],
                'SELECT address FROM player_address WHERE player_id = :player_id AND guild_id = :guild_id',
                true,
                false,
                null,
                Response::HTTP_OK,
                0,
                null,
            ]
        ];
    }

    /**
     * @dataProvider queryAllProvider
     * @param array $requestParams
     * @param array $requiredFields
     * @param string $query
     * @param bool $isFetchExpected
     * @param bool $hasFetchResult
     * @param mixed $fetchResult
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     */
    public function testQueryAll(
        array $requestParams,
        array $requiredFields,
        string $query,
        bool $isFetchExpected,
        bool $hasFetchResult,
        mixed $fetchResult,
        int $expectedHttpStatusCode,
        int $expectedErrorCount,
        mixed $expectedData
    ) {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $connectionMock = $this->createMock(Connection::class);
        $connectionMock->expects($this->exactly($isFetchExpected ? 1 : 0))
            ->method('fetchAllAssociative')
            ->with($query, $requestParams)
            ->willReturn($hasFetchResult
                ? $fetchResult
                : []
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $apiRequestParsingManager = new ApiRequestParsingManager(
            $container->get(ValidatorInterface::class),
            new ConstraintViolationUtil()
        );

        $trait = new class { use ApiSqlQueryTrait; };
        $response = $trait->queryAll(
            $entityManagerStub,
            $apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function queryAllProvider() : array
    {
        return [
            'valid' => [
                [ApiParameters::PLAYER_ID => "1-13"],
                [ApiParameters::PLAYER_ID],
                'SELECT address FROM player_address WHERE player_id = :player_id',
                true,
                true,
                [
                    ['address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz'],
                    ['address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9f2']
                ],
                Response::HTTP_OK,
                0,
                [
                    ['address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz'],
                    ['address' => 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9f2']
                ],
            ],
            'bad request params' => [
                [ApiParameters::PLAYER_ID => "!1-13"],
                [ApiParameters::PLAYER_ID],
                'SELECT address FROM player_address WHERE player_id = :player_id',
                false,
                false,
                [],
                Response::HTTP_BAD_REQUEST,
                1,
                null,
            ],
            'no matching records' => [
                [ApiParameters::PLAYER_ID => "10-13"],
                [ApiParameters::PLAYER_ID],
                'SELECT address FROM player_address WHERE player_id = :player_id',
                true,
                false,
                [],
                Response::HTTP_OK,
                0,
                [],
            ]
        ];
    }
}