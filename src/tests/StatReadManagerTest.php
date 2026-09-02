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
     * Samples are change-triggered, so a bucket has to carry forward each object's
     * last known value rather than aggregating only the objects that moved. The
     * seed CTE bounds the history scan; without it the query scanned the whole
     * table once per bucket and timed out at the maximum window.
     */
    public function testAggregateUsesBoundedCarryForward(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        (new StatReadManager($this->entityManager($connection), $this->validator()))
            ->getStatAggregate('ore', 'player', (string) (time() - 3600), (string) time(), '1h');

        $this->assertStringContainsString('seed AS', $captured);
        $this->assertStringContainsString('in_range AS', $captured);
        $this->assertStringContainsString('AS population', $captured);
        $this->assertStringContainsString('AS samples', $captured);

        // Empty buckets report null, not a false zero that would draw an opening ramp.
        $this->assertStringContainsString('CASE WHEN population > 0 THEN total END AS sum', $captured);

        // Both ends of the window are bounded.
        $this->assertStringContainsString('s.time >= (SELECT b0 + step FROM bounds)', $captured);
        $this->assertStringContainsString('s.time < (SELECT bn + step FROM bounds)', $captured);
    }
}
