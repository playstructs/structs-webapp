<?php

namespace App\Tests;

use App\Entity\PlayerAddress;
use App\Manager\PlayerAddressManager;
use App\Repository\PlayerAddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerAddressManagerTest extends KernelTestCase
{
    /**
     * @dataProvider getPlayerIdByAddressAndGuildProvider
     * @param string $address
     * @param string $guild_id
     * @param bool $playerAddressExists
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
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
        $playerAddressRepository->method('findOneBy')
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
}