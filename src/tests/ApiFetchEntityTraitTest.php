<?php

use App\Constant\ApiParameters;
use App\Entity\PlayerAddress;
use App\Manager\ApiRequestParsingManager;
use App\Repository\PlayerAddressRepository;
use App\Trait\ApiFetchEntityTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ApiFetchEntityTraitTest extends KernelTestCase
{
    /**
     * @dataProvider fetchOneProvider
     * @param array $requestParams
     * @param array $requiredFields
     * @param array $optionalFields
     * @param array $criteria
     * @param array $returnFields
     * @param bool $isFindExpected
     * @param bool $hasFindResult
     * @param string $entityClassName
     * @param string $entityProviderClassName
     * @param array $entityReturnMap
     * @param int $expectedHttpStatusCode
     * @param int $expectedErrorCount
     * @param mixed $expectedData
     * @return void
     */
    public function testFetchOne(
        array $requestParams,
        array $requiredFields,
        array $optionalFields,
        array $criteria,
        array $returnFields,
        bool $isFindExpected,
        bool $hasFindResult,
        string $entityClassName,
        string $entityProviderClassName,
        array $entityReturnMap,
        int $expectedHttpStatusCode,
        int $expectedErrorCount,
        mixed $expectedData
    ): void
    {
        // (1) boot the Symfony kernel
        self::bootKernel();

        // (2) use static::getContainer() to access the service container
        $container = static::getContainer();

        $entity = $this->createStub($entityClassName);
        $entity->method('get')
            ->willReturnMap($entityReturnMap);

        $repository = $this->createMock($entityProviderClassName);
        $repository->expects($this->exactly($isFindExpected ? 1 : 0))
            ->method('findOneBy')
            ->with($criteria)
            ->willReturn($hasFindResult
                ? $entity
                : null
            );

        $entityManagerStub = $this->createStub(EntityManagerInterface::class);
        $entityManagerStub->method('getRepository')
            ->willReturnMap([
                [$entityClassName, $repository]
            ]);

        $apiRequestParsingManager = new ApiRequestParsingManager(
            $container->get(ValidatorInterface::class),
            new ConstraintViolationUtil()
        );

        $trait = new class { use ApiFetchEntityTrait; };

        $response = $trait->fetchOne(
            $entityManagerStub,
            $apiRequestParsingManager,
            $entityClassName,
            $requestParams,
            $requiredFields,
            $optionalFields,
            $criteria,
            $returnFields
        );

        $responseContent = json_decode($response->getContent(), true);

        $this->assertSame($expectedHttpStatusCode, $response->getStatusCode());
        $this->assertSame($expectedErrorCount, count($responseContent['errors']));
        $this->assertSame($expectedData, $responseContent['data']);
    }

    public function fetchOneProvider() : array
    {
        return [
            'valid'  => [
                [
                    ApiParameters::ADDRESS => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                    ApiParameters::GUILD_ID => '0-1'
                ],
                [
                    ApiParameters::ADDRESS,
                    ApiParameters::GUILD_ID
                ],
                [],
                [
                    ApiParameters::ADDRESS => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                    ApiParameters::GUILD_ID => '0-1',
                    'status' => 'approved'
                ],
                [ApiParameters::PLAYER_ID],
                true,
                true,
                PlayerAddress::class,
                PlayerAddressRepository::class,
                [[ApiParameters::PLAYER_ID, '1-1']],
                Response::HTTP_OK,
                0,
                ['player_id' => '1-1']
            ],
            'bad request params'  => [
                [
                    ApiParameters::ADDRESS => '!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                    ApiParameters::GUILD_ID => '!0-1'
                ],
                [
                    ApiParameters::ADDRESS,
                    ApiParameters::GUILD_ID
                ],
                [],
                [
                    ApiParameters::ADDRESS => '!structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                    ApiParameters::GUILD_ID => '!0-1',
                    'status' => 'approved'
                ],
                [ApiParameters::PLAYER_ID],
                false,
                false,
                PlayerAddress::class,
                PlayerAddressRepository::class,
                [],
                Response::HTTP_BAD_REQUEST,
                2,
                null
            ],
            'no matching record'  => [
                [
                    ApiParameters::ADDRESS => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                    ApiParameters::GUILD_ID => '0-1'
                ],
                [
                    ApiParameters::ADDRESS,
                    ApiParameters::GUILD_ID
                ],
                [],
                [
                    ApiParameters::ADDRESS => 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7zaf',
                    ApiParameters::GUILD_ID => '0-1',
                    'status' => 'approved'
                ],
                [ApiParameters::PLAYER_ID],
                true,
                false,
                PlayerAddress::class,
                PlayerAddressRepository::class,
                [[ApiParameters::PLAYER_ID, '1-1']],
                Response::HTTP_OK,
                0,
                null
            ],
        ];
    }
}