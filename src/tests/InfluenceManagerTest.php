<?php

use App\Manager\InfluenceManager;
use App\Util\InfluenceParameters;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\TestCase;

class InfluenceManagerTest extends TestCase
{
    /** @dataProvider invalidQueries */
    public function testInvalidRequestsNeverReachDatabase(string $operation, array $args): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->never())->method('beginTransaction');
        $db->expects($this->never())->method('fetchAllAssociative');
        $db->expects($this->never())->method('fetchAssociative');
        $response = (new InfluenceManager($db))->$operation(...$args);
        $this->assertSame(400, $response->getStatusCode(), $response->getContent());
        $this->assertFalse(json_decode($response->getContent(), true)['success']);
    }

    public static function invalidQueries(): array
    {
        return [
            ['contest', ['9223372036854775808']],
            ['standings', ['1', ['sector' => ['127']]]],
            ['standings', ['1', ['sector' => '1']]],
            ['standings', ['1', ['order' => 'points;DROP TABLE x']]],
            ['guild', ['1', '1-2']],
            ['player', ['1', '1-18446744073709551616']],
            ['players', ['1', ['limit' => '1.5']]],
            ['players', ['1', ['after_id' => '1-2'], '2']],
            ['players', ['1', ['include_total' => 'true']]],
            ['planet', ['1', '1-1']],
            ['planet', ['1', '2-0']],
            ['planet', ['1', '2-18446744073709551616']],
            ['planet', ['1', '2-1', ['sector' => '127']]],
            ['planets', ['1', []]],
            ['planets', ['1', ['planet_ids' => '']]],
            ['planets', ['1', ['planet_ids' => ['2-1', '2-2']]]],
            ['planets', ['1', ['planet_ids' => '2-1, 2-2']]],
            ['planets', ['1', ['planet_ids' => '2-1,']]],
            ['planets', ['1', ['planet_ids' => "2-1'); DROP TABLE planet;--"]]],
            ['planets', ['1', ['planet_ids' => implode(',', array_fill(0, 101, '2-1'))]]],
            ['planets', ['1', ['planet_ids' => '2-1', 'limit' => '1']]],
            ['contests', [['chain_id' => "x';--"]]],
            ['contests', [[], '999999999999999999999999']],
            ['history', ['1', 'contest', null, []]],
            ['history', ['1', 'contest', null, ['start_height' => '10', 'end_height' => '9']]],
            ['history', ['1', 'contest', null, ['start_height' => '1', 'end_height' => '1000001']]],
            ['history', ['1', 'contest', null, ['start_height' => '1', 'end_height' => '1001', 'bucket_blocks' => '1']]],
            ['history', ['1', 'contest', null, ['start_height' => '1e3', 'end_height' => '2000']]],
            ['history', ['1', 'player', '1-1', ['start_height' => '1', 'end_height' => '2', 'group_by' => 'guild']]],
            ['history', ['1', 'guild', '0-1', ['start_height' => '1', 'end_height' => '2', 'limit' => '10']]],
        ];
    }

    public function testPlanetBatchPreservesOrderAndAcceptsUint64Ids(): void
    {
        $this->assertSame(['2-2', '2-1', '2-18446744073709551615'],
            InfluenceParameters::planetIds('2-2,2-1,2-2,2-18446744073709551615'));
        $this->assertCount(100, InfluenceParameters::planetIds(implode(',', array_map(fn ($i) => '2-' . $i, range(1, 100)))));
    }

    public function testPagingMatchesCatalogLimitsAndChecksOverflow(): void
    {
        $this->assertSame([1, 100, 0, false], InfluenceParameters::page([], '1'));
        $this->assertSame([2, 10000, 10000, true], InfluenceParameters::page(['limit' => '99999', 'include_total' => '1'], '2'));
        $this->assertSame([1, 100, 0, false], InfluenceParameters::page(['limit' => '0'], '1'));
        $this->assertSame('1-18446744073709551615', InfluenceParameters::objectId('1-18446744073709551615', 'player'));
    }

    public function testContestDataAndMetadataUseOneReadOnlySnapshot(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())->method('beginTransaction');
        $db->expects($this->once())->method('commit');
        $db->expects($this->never())->method('rollBack');
        $db->expects($this->exactly(2))->method('executeStatement')->withConsecutive(
            ['SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY'], ["SET LOCAL statement_timeout='5s'"]);
        $db->expects($this->once())->method('fetchAssociative')->willReturn([
            'contest_id' => '1', 'chain_id' => 'test', 'start_height' => '10', 'end_height' => '20', 'rule_id' => '1',
            'scoring_mode' => 'single_sector', 'win_points' => '100', 'claim_points' => '200', 'policy' => '{}',
            'build_id' => '2', 'projected_height' => '15', 'state' => 'live', 'coverage_start' => '10',
            'source_height' => '15', 'sectors_complete' => true, 'complete_before_height' => '0',
        ]);
        $r = (new InfluenceManager($db))->contest('1');
        $body = json_decode($r->getContent(), true);
        $this->assertSame(200, $r->getStatusCode());
        $this->assertSame('15', $body['meta']['height']);
        $this->assertSame($body['data']['build_id'], $body['meta']['build_id']);
    }
}
