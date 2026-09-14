<?php

use App\Tests\ApiManagerTestCase;
use App\Dto\ApiRequestParamsDto;
use App\Manager\StatReadManager;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Constraints\Choice;

class StatReadManagerTest extends ApiManagerTestCase
{
    public function testFamilyTwoStatRangeRejectsWrongObjectType(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $manager = new StatReadManager($this->entityManager($connection), $this->validator());
        $response = $manager->getStatRange(
            'structs_load',
            '5-1',
            1,
            (string) time(),
            (string) (time() + 60)
        );

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('object_key_invalid', $content['errors']);
    }

    /**
     * Family-two tables have no object_type column, so a cross-type request has to
     * 4xx rather than silently scanning the whole table.
     */
    public function testFamilyTwoAggregateRejectsWrongObjectType(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $manager = new StatReadManager($this->entityManager($connection), $this->validator());
        $response = $manager->getStatAggregate(
            'connection_capacity',
            'player',
            (string) time(),
            (string) (time() + 3600),
            '1h'
        );

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('object_type_invalid', $content['errors']);
    }

    /** An unknown metric is refused before any table name is interpolated. */
    public function testAggregateRejectsUnknownMetric(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $response = (new StatReadManager($this->entityManager($connection), $this->validator()))
            ->getStatAggregate('not_a_metric', 'player', (string) time(), (string) (time() + 3600), '1h');

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertNotEmpty(json_decode($response->getContent(), true)['errors']);
    }

    /**
     * ApiRequestParamsDto::$metric carries its own Assert\Choice list, so a metric
     * added to the manager's table maps is silently rejected at validation until
     * the DTO is updated too.
     */
    public function testDtoMetricChoicesMatchTheManagerTables(): void
    {
        $managerMetrics = [];
        foreach (['FAMILY_ONE_TABLES', 'FAMILY_TWO_TABLES'] as $const) {
            $managerMetrics = array_merge(
                $managerMetrics,
                array_keys((new ReflectionClass(StatReadManager::class))->getConstant($const))
            );
        }

        $property = new ReflectionProperty(ApiRequestParamsDto::class, 'metric');
        $dtoMetrics = [];
        foreach ($property->getAttributes(Choice::class) as $attribute) {
            $arguments = $attribute->getArguments();
            $dtoMetrics = array_merge($dtoMetrics, $arguments['choices'] ?? $arguments[0]);
        }

        sort($managerMetrics);
        sort($dtoMetrics);
        $this->assertSame($managerMetrics, $dtoMetrics);
    }

    /**
     * Aggregates read the precomputed stat_rollup rather than reconstructing LOCF
     * over the change-triggered stat_* hypertables on every request.
     */
    public function testAggregateReadsStatRollup(): void
    {
        $captured = null;
        $capturedParams = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturnCallback(function (string $sql, array $params = []) use (&$captured, &$capturedParams) {
                $captured = $sql;
                $capturedParams = $params;

                return [];
            });
        $connection->method('fetchAssociative')->willReturn(['source_height' => 1]);

        (new StatReadManager($this->entityManager($connection), $this->validator()))
            ->getStatAggregate('ore', 'player', (string) (time() - 3600), (string) time(), '1h');

        $this->assertStringContainsString('FROM structs.stat_rollup', $captured);
        $this->assertStringNotContainsString('seed AS', $captured);
        $this->assertStringContainsString('CASE WHEN population > 0 THEN sum / population END AS avg', $captured);
        $this->assertStringContainsString("object_type = CAST(:object_type AS structs.object_type)", $captured);
        $this->assertSame('player', $capturedParams['object_type']);
        $this->assertSame('ore', $capturedParams['metric']);
    }

    public function testAggregateDailyUsesLastHourlyRowPerDay(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        (new StatReadManager($this->entityManager($connection), $this->validator()))
            ->getStatAggregate('ore', 'player', (string) (time() - 86400), (string) time(), '1d');

        $this->assertStringContainsString("DISTINCT ON (date_trunc('day', bucket))", $captured);
        $this->assertStringContainsString("ORDER BY date_trunc('day', bucket), bucket DESC", $captured);
        $this->assertStringContainsString('sum(samples) OVER (PARTITION BY date_trunc(\'day\', bucket))', $captured);
    }

    public function testAggregateBindsObjectTypeForFamilyTwo(): void
    {
        $capturedParams = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturnCallback(function (string $sql, array $params = []) use (&$capturedParams) {
                $capturedParams = $params;

                return [];
            });
        $connection->method('fetchAssociative')->willReturn(['source_height' => 1]);

        (new StatReadManager($this->entityManager($connection), $this->validator()))
            ->getStatAggregate(
                'connection_count',
                'substation',
                (string) (time() - 3600),
                (string) time(),
                '1h'
            );

        $this->assertSame('substation', $capturedParams['object_type']);
        $this->assertSame('connection_count', $capturedParams['metric']);
    }
}
