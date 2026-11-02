<?php

use App\Manager\TableReadManager;
use App\Tests\ApiManagerTestCase;
use App\Util\PlanetActivityQuery;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;

class PlanetActivityEventTest extends ApiManagerTestCase
{
    public function testExactKeyAndInvalidInputNeverReachesSql(): void
    {
        // Valid keys parse unchanged, including offsets and fractional seconds.
        foreach (['2026-10-30T12:34:56.123456Z', '2026-10-30T12:34:56.1+00:00', '2026-10-30T12:34:56-04:00'] as $time) {
            $this->assertSame(
                ['planet_id' => '2-1', 'seq' => '0', 'time' => $time],
                PlanetActivityQuery::parse('2-1', '0', ['time' => $time])
            );
        }

        // Invalid planet, seq or time is rejected before any SQL.
        $db = $this->createMock(Connection::class);
        $db->expects($this->never())
            ->method('fetchAssociative');
        $manager = new TableReadManager($this->entityManager($db), $this->validator());
        foreach ([
            ['1-1', '0', ['time' => '2026-10-30T12:34:56Z']],
            ['2-1', '2147483648', ['time' => '2026-10-30T12:34:56Z']],
            ['2-1', '01', ['time' => '2026-10-30T12:34:56Z']],
            ['2-1', '0', []],
            ['2-1', '0', ['time' => []]],
            ['2-1', '0', ['time' => '2026-02-30T12:34:56Z']],
            ['2-1', '0', ['time' => '2026-10-30T12:34:56.1234567Z']],
            ['2-1', '0', ['time' => '2026-10-30T12:34:56+14:01']],
            ['2-1', '0', ['time' => '2026-10-30T12:34:56Z', 'extra' => '1']],
        ] as $args) {
            $this->assertSame(400, $manager->planetActivityEvent(...$args)->getStatusCode());
        }
    }

    public function testRestrictedRoleReadsOnlyTheExactCapturedEvent(): void
    {
        $url = getenv('INTEGRATION_DATABASE_URL');
        if (!$url) {
            $this->markTestSkipped('Requires disposable Sqitch database');
        }

        // A captured combat event detail larger than 8 KB.
        $capture = json_decode(file_get_contents(__DIR__ . '/../../tools/proto/combat-v022.json'), true);
        $detail = json_decode($capture['fixtures'][4]['event']['attributes'][0]['value'], true);
        $this->assertGreaterThan(8000, strlen(json_encode($detail)));

        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $time = '2026-10-30T12:34:56.123456Z';
            $db->executeStatement(
                "INSERT INTO structs.planet_activity(time,planet_id,seq,category,detail,block_height)
                VALUES(:time,'2-990976',0,'struct_attack',CAST(:detail AS jsonb),3353001)",
                ['time' => $time, 'detail' => json_encode($detail)]
            );
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new TableReadManager($this->entityManager($db), $this->validator());
            $result = json_decode(
                $manager->planetActivityEvent('2-990976', '0', ['time' => $time])->getContent(),
                true
            );
            $this->assertTrue($result['success']);
            $this->assertSame($time, $result['data']['time']);
            $this->assertSame('3353001', $result['data']['block_height']);
            $this->assertSame('0', $result['data']['seq']);
            $this->assertEquals($detail, $result['data']['detail']);

            // Any other seq, planet or microsecond finds nothing.
            foreach ([
                ['2-990976', '1', $time],
                ['2-990975', '0', $time],
                ['2-990976', '0', '2026-10-30T12:34:56.123457Z'],
            ] as [$planet, $seq, $at]) {
                $this->assertNull(json_decode(
                    $manager->planetActivityEvent($planet, $seq, ['time' => $at])->getContent(),
                    true
                )['data']);
            }
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
