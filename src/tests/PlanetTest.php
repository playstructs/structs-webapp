<?php

use App\Constant\ApiParameters;
use App\Manager\PlanetManager;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlanetTest extends KernelTestCase
{
    /**
     * @dataProvider calcPlanetaryShieldHealthProvider
     * @param int $planetaryShield
     * @param int $blockStartRaid
     * @param int $currentBlock
     * @param int $expectedShieldHealth
     * @return void
     */
    public function testCalcPlanetaryShieldHealth(
        int $planetaryShield,
        int $blockStartRaid,
        int $currentBlock,
        int $expectedShieldHealth
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $planetManager = new PlanetManager(
            $this->createStub(EntityManagerInterface::class),
            $container->get(ValidatorInterface::class)
        );

        $shieldHealth = $planetManager->calcPlanetaryShieldHealth(
            $planetaryShield,
            $blockStartRaid,
            $currentBlock
        );

        $this->assertSame($expectedShieldHealth, $shieldHealth);
    }

    public function calcPlanetaryShieldHealthProvider() : array
    {
        return [
//            'test case' => [
//                'planetaryShield',
//                'blockStartRaid',
//                'currentBlock',
//                'expectedShieldHealth'
//            ],
            'Current Block 1' => [
                100,
                0,
                1,
                99
            ],
            'Current Block 10' => [
                100,
                0,
                10,
                90
            ],
            'Current Block 50' => [
                100,
                0,
                50,
                50
            ],
            'Current Block 80' => [
                100,
                0,
                80,
                20
            ],
            'Current Block 100' => [
                100,
                0,
                100,
                0
            ],
            'Current Block 1000' => [
                100,
                0,
                1000,
                0
            ],
            'Between 0 and 1' => [
                10000,
                0,
                9999,
                1
            ],
        ];
    }

    /**
     * @dataProvider getPlanetaryShieldHealthProvider
     * @param string $planet_id
     * @param array|false $queryReturnValue
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     * @throws \Doctrine\DBAL\Exception
     */
    public function testGetPlanetaryShieldHealth(
        string $planet_id,
        array|false $queryReturnValue,
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
            ->with($this->anything(), [ApiParameters::PLANET_ID => $planet_id])
            ->willReturn($queryReturnValue);

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getConnection')
            ->willReturn($connectionMock);

        $manager = new PlanetManager(
            $entityManagerStub,
            $container->get(ValidatorInterface::class),
        );

        $response = $manager->getPlanetaryShieldHealth($planet_id);

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function getPlanetaryShieldHealthProvider(): array
    {
        return [
            'Valid Health 99' => [
                '2-1',
                [
                    'planetary_shield' => 100,
                    'block_start_raid' => 0,
                    'current_block' => 1
                ],
                Response::HTTP_OK,
                0,
                ['health' => 99]
            ],
            'Valid 0 < Health < 1' => [
                '2-1',
                [
                    'planetary_shield' => 10000,
                    'block_start_raid' => 0,
                    'current_block' => 9999
                ],
                Response::HTTP_OK,
                0,
                ['health' => 1]
            ],
            'Valid Health 0' => [
                '2-1',
                [
                    'planetary_shield' => 10000,
                    'block_start_raid' => 0,
                    'current_block' => 10000
                ],
                Response::HTTP_OK,
                0,
                ['health' => 0]
            ],
            'Valid Health < 0' => [
                '2-1',
                [
                    'planetary_shield' => 100,
                    'block_start_raid' => 0,
                    'current_block' => 99999
                ],
                Response::HTTP_OK,
                0,
                ['health' => 0]
            ],
            'Planet does not exist' => [
                '2-1',
                false,
                Response::HTTP_OK,
                0,
                null
            ],
            'Invalid param' => [
                '!2-1',
                false,
                Response::HTTP_BAD_REQUEST,
                1,
                null
            ],
        ];
    }


}