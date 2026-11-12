<?php

use App\Manager\InfluenceManager;
use App\Query\InfluenceQuery;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Response;

class InfluenceDatabaseTest extends ApiManagerTestCase
{
    private function database(): Connection
    {
        if (!$url = getenv('INTEGRATION_DATABASE_URL')) $this->markTestSkipped('Requires the disposable Sqitch database');
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        return $db;
    }

    private function body(Response $response, int $status = 200): array
    {
        $this->assertSame($status, $response->getStatusCode(), $response->getContent());
        return json_decode($response->getContent(), true, 512, JSON_THROW_ON_ERROR);
    }

    private function fixture(Connection $db, string $mode = 'planet_sectors', bool $short = false, int $start = 1000): array
    {
        $chain = 'influence-api-' . bin2hex(random_bytes(5));
        $db->executeStatement('INSERT INTO structs.influence_source_cursor VALUES(:chain,:start,999,\'h999\')', ['chain' => $chain, 'start' => $start]);
        foreach (['1-1' => '0-1', '1-2' => '0-1', '1-3' => '0-2', '1-4' => '0-3', '1-5' => null] as $player => $guild) {
            $db->executeStatement('INSERT INTO structs.influence_membership_history(chain_id,player,height,phase,tx_index,event_index,guild,baseline)
                VALUES(:chain,:player,:base,0,-1,0,:guild,true)', ['chain' => $chain, 'player' => $player, 'guild' => $guild, 'base' => $start - 1]);
        }
        $end = $short ? 1000 : 2505;
        $cid = (string) $db->fetchOne('SELECT structs.influence_create_contest(:chain,:start,:end,1,:mode)', ['chain' => $chain, 'start' => $start, 'end' => $end, 'mode' => $mode]);
        for ($h = 1000; $h <= $end; $h++) {
            $events = match ($h) {
                1000 => [['raid','1-1','0-1','2-1',127], ['raid','1-2','0-1','2-1',127], ['raid','1-3','0-2','2-2',44]],
                1001 => [['member','1-2','0-2'], ['member','1-1','0-2'], ['raid','1-3','0-2','2-1',127]],
                1002 => [['raid','1-4','0-3','2-1',127]], // Defender succeeds; the claim clears.
                1003 => [['member','1-3',null]],
                1500 => [['raid','1-1','0-2','2-1',127]],
                1501 => [['member','1-3','0-2']],
                2000 => [['raid','1-2','0-2','2-3',999]],
                default => [],
            };
            $this->block($db, $chain, $h, $events);
        }
        $bid = (string) $db->fetchOne('SELECT build_id FROM structs.influence_published_build WHERE contest_id=:id', ['id' => $cid]);
        return [$cid, $bid, $chain];
    }

    private function block(Connection $db, string $chain, int $height, array $events): void
    {
        foreach ($events as $i => $e) {
            $position = json_encode(['chain' => $chain, 'height' => $height, 'hash' => 'h' . $height,
                'time' => '2026-11-11T22:00:00Z', 'phase' => 2, 'tx_index' => 0, 'event_index' => $i, 'msg_index' => 0]);
            if ($e[0] === 'member') {
                $db->executeStatement('SELECT structs.influence_record_member(CAST(:p AS jsonb),:player,:guild)', ['p' => $position, 'player' => $e[1], 'guild' => $e[2]]);
            } else {
                $fact = json_encode(['attacker' => $e[1], 'attacker_guild' => $e[2], 'defender' => '1-4', 'defender_guild' => '0-3', 'planet' => $e[3], 'sector' => $e[4]]);
                $db->executeStatement('SELECT structs.influence_record_raid(CAST(:p AS jsonb),CAST(:f AS jsonb))', ['p' => $position, 'f' => $fact]);
            }
        }
        $db->executeStatement('SELECT structs.influence_finish_block(:chain,:height,:hash)', ['chain' => $chain, 'height' => $height, 'hash' => 'h' . $height]);
    }

    private function restrict(Connection $db): void
    {
        $db->executeStatement('ALTER ROLE structs_webapp NOSUPERUSER');
        $db->executeStatement('SET LOCAL ROLE structs_webapp');
    }

    public function testScoresHistoryTransfersAndFrozenResultsWithWebappPrivileges(): void
    {
        $db = $this->database();
        try {
            [$cid, $bid, $chain] = $this->fixture($db);
            $this->block($db, $chain, 2506, [['member','1-1','0-1']]);
            $this->restrict($db);
            $api = new InfluenceManager($db);
            $guild = $this->body($api->guild($cid, '0-2'));
            $this->assertSame('900', $guild['data']['points']);
            $this->assertSame('2505', $guild['meta']['height']);
            $this->assertSame('2506', $guild['meta']['source_height']);
            $this->assertSame('final', $guild['meta']['status']);
            $this->assertCount(3, $guild['data']['sectors']);
            $this->assertSame([true, true, true], array_column($guild['data']['sectors'], 'is_winner'));
            $this->assertSame('300', $this->body($api->guild($cid, '0-2', ['sector' => '127']))['data']['points']);
            $this->assertSame('0', $this->body($api->guild($cid, '0-3'))['data']['points']);
            $player = $this->body($api->player($cid, '1-1'));
            $this->assertSame('300', $player['data']['points']);
            $this->assertSame('0-2', $player['data']['guild_id'], 'Membership freezes at the ending block');
            $this->assertFalse($player['meta']['additive_to_guild']);
            $this->assertSame('400', $this->body($api->player($cid, '1-2'))['data']['points']);
            $this->assertSame('400', $this->body($api->player($cid, '1-3'))['data']['points']);

            $q = ['start_height' => '1000', 'end_height' => '1003', 'bucket_blocks' => '1'];
            $g = $this->body($api->history($cid, 'guild', '0-2', $q));
            $this->assertSame(['300','600','400','100'], array_column($g['data']['samples'], 'points'));
            $this->assertSame(['300','300','-200','-300'], array_column($g['data']['samples'], 'points_delta'));
            $p = $this->body($api->history($cid, 'player', '1-3', $q));
            $this->assertSame(['300','600','400','400'], array_column($p['data']['samples'], 'points'), 'Guildless players retain personal achievements');
            $partial = $this->body($api->history($cid, 'guild', '0-2', ['start_height' => '1002', 'end_height' => '1003', 'bucket_blocks' => '1']));
            $this->assertSame('600', $partial['data']['opening'][0]['points']);
            $this->assertSame(['400','100'], array_column($partial['data']['samples'], 'points'));
            $q = ['start_height' => '1001', 'end_height' => '2505', 'bucket_blocks' => '600'];
            $end = $this->body($api->history($cid, 'player', '1-2', $q));
            $this->assertSame(['1600','2200','2505'], array_column($end['data']['samples'], 'height'));
            $this->assertSame(['100','400','400'], array_column($end['data']['samples'], 'points'));
            $this->assertSame('300', $end['data']['opening'][0]['points']);
            foreach (['total', 'sector', 'guild', 'guild_sector'] as $group) {
                $data = $this->body($api->history($cid, 'contest', null, $q + ['group_by' => $group]));
                $last = array_filter($data['data']['samples'], fn ($r) => $r['height'] === '2505');
                $this->assertSame(900, array_sum(array_column($last, 'points')));
            }
            $scoped = $this->body($api->history($cid, 'player', '1-2', $q + ['sector' => '999', 'group_by' => 'sector']));
            $this->assertSame(['0','300','300'], array_column($scoped['data']['samples'], 'points'));
            $this->assertSame([999,999,999], array_column($scoped['data']['samples'], 'sector'));
            $this->body($api->history($cid, 'contest', null, ['start_height' => '999', 'end_height' => '1000']), 422);
            $this->body($api->history($cid, 'contest', null, ['start_height' => '2505', 'end_height' => '2506']), 422);
            $this->body($api->player($cid, '1-999'), 404);
            $this->body($api->guild($cid, '0-999'), 404);
            $this->body($api->contest('999999'), 404);
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testPaginationFiltersAndSingleSectorTie(): void
    {
        $db = $this->database();
        try {
            [$cid, $bid, $chain] = $this->fixture($db, 'single_sector', true);
            $this->restrict($db); $api = new InfluenceManager($db);
            $page = $this->body($api->players($cid, ['limit' => '2', 'include_total' => '1']));
            $this->assertSame(['1-1','1-2'], array_column($page['data'], 'player_id'));
            $this->assertSame('5', $page['total']); $this->assertTrue($page['meta']['has_more']);
            $next = $this->body($api->players($cid, ['limit' => '2'], '2'));
            $cursor = $this->body($api->players($cid, ['limit' => '2', 'after_id' => $page['meta']['next_after_id']]));
            $this->assertSame($next['data'], $cursor['data']);
            $last = $this->body($api->players($cid, ['limit' => '2'], '3'));
            $this->assertSame(['1-5'], array_column($last['data'], 'player_id'));
            $this->assertFalse($last['meta']['has_more']);
            $filtered = $this->body($api->players($cid, ['guild_id' => '0-2', 'sector' => '0', 'include_total' => '1']));
            $this->assertSame('1', $filtered['total']);
            $this->assertSame('300', $filtered['data'][0]['points']);
            $this->assertArrayNotHasKey('total', $next);
            $standings = $this->body($api->standings($cid));
            $this->assertSame(['300','300','0'], array_column($standings['data'], 'points'));
            $this->assertSame([true,true,false], array_column($standings['data'], 'is_winner'));
            $this->assertSame([true,true,false], array_column($standings['data'], 'tied_for_lead'));
            $this->assertSame([0,0,0], array_column($standings['data'], 'sector'));
            $this->body($api->standings($cid, ['sector' => '127']), 400);
            $list = $this->body($api->contests(['chain_id' => $chain, 'limit' => '1', 'include_total' => '1']));
            $this->assertSame('1', $list['total']); $this->assertSame($cid, $list['data'][0]['contest_id']);
            $this->assertSame([], $this->body($api->contests(['chain_id' => $chain, 'after_id' => $cid]))['data']);
            $history = $this->body($api->history($cid, 'player', '1-2', ['start_height' => '1000', 'end_height' => '1000', 'bucket_blocks' => '1', 'group_by' => 'sector']));
            $this->assertSame(0, $history['data']['samples'][0]['sector']);
            $this->assertSame('300', $history['data']['samples'][0]['points']);
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testPlanetSnapshotsFollowTransfersClaimsAndContestBounds(): void
    {
        $db = $this->database();
        try {
            foreach (['planet_sectors', 'single_sector'] as $mode) {
                // Earlier raids exist, but this new contest starts after them.
                [, , $chain] = $this->fixture($db, $mode, true);
                $cid = (string) $db->fetchOne('SELECT structs.influence_create_contest(:chain,1001,1005,1,:mode)', ['chain' => $chain, 'mode' => $mode]);
                $api = new InfluenceManager($db);
                $this->restrict($db);
                $this->assertFalse($this->body($api->planet($cid, '2-1'))['data']['exists']);
                $db->executeStatement('RESET ROLE');
                $this->block($db, $chain, 1001, [['raid','1-1','0-1','2-1',127], ['raid','1-2','0-1','2-1',127]]);
                $this->restrict($db);
                $single = $this->body($api->planet($cid, '2-1'));
                $p = $single['data'];
                $this->assertTrue($p['exists']);
                $this->assertSame($mode === 'single_sector' ? 0 : 127, $p['sector']);
                $this->assertSame(127, $p['latest_raid']['source_sector']);
                $this->assertSame('1-2', $p['holder'], 'Last event in the same block wins the claim');
                $this->assertSame('0-1', $p['holder_guild_id']);
                $this->assertSame('1-2', $p['latest_raid']['attacker']);
                $this->assertSame('1001', $p['latest_raid']['height']);
                $this->assertSame([['guild_id' => '0-1', 'supporter_count' => '2']], $p['guild_coverage']);
                $batch = $this->body($api->planets($cid, ['planet_ids' => '2-999,2-1,2-999']));
                $this->assertSame(['2-999','2-1'], array_column($batch['data'], 'planet_id'));
                $this->assertSame($single['meta'], $batch['meta']);
                $this->assertSame($p, $batch['data'][1]);
                $empty = $batch['data'][0];
                $this->assertFalse($empty['exists']);
                foreach (['sector','holder','holder_guild_id','latest_raid'] as $key) $this->assertNull($empty[$key]);
                $this->assertSame([], $empty['guild_coverage']);
                $hundred = $this->body($api->planets($cid, ['planet_ids' => implode(',', array_map(fn ($i) => '2-' . $i, range(1, 100)))]));
                $this->assertCount(100, $hundred['data']);
                $this->body($api->planet('999999', '2-1'), 404);
                $this->body($api->planets('999999', ['planet_ids' => '2-1']), 404);

                $db->executeStatement('RESET ROLE');
                $this->block($db, $chain, 1002, [['member','1-2','0-2']]);
                $this->restrict($db);
                $p = $this->body($api->planet($cid, '2-1'))['data'];
                $this->assertSame('0-2', $p['holder_guild_id']);
                $this->assertSame('0-1', $p['latest_raid']['attacker_guild'], 'Raid-time guild is immutable');
                $this->assertSame([['guild_id'=>'0-1','supporter_count'=>'1'], ['guild_id'=>'0-2','supporter_count'=>'1']], $p['guild_coverage']);
                $db->executeStatement('RESET ROLE');
                $this->block($db, $chain, 1003, [['member','1-1','0-2']]);
                $this->restrict($db);
                $p = $this->body($api->planet($cid, '2-1'))['data'];
                $this->assertSame([['guild_id'=>'0-2','supporter_count'=>'2']], $p['guild_coverage'], 'Old guild loses credit after its last supporter leaves');

                $db->executeStatement('RESET ROLE');
                $this->block($db, $chain, 1004, [['raid','1-4','0-3','2-1',127]]);
                $this->restrict($db);
                $cleared = $this->body($api->planet($cid, '2-1'))['data'];
                $this->assertTrue($cleared['exists']);
                $this->assertNull($cleared['holder']); $this->assertNull($cleared['holder_guild_id']);
                $this->assertSame('1-4', $cleared['latest_raid']['attacker']);
                $this->assertSame($p['guild_coverage'], $cleared['guild_coverage'], 'Ineligible success clears only the maintained claim');

                $db->executeStatement('RESET ROLE');
                $this->block($db, $chain, 1005, [['raid','1-3','0-2','2-1',127], ['member','1-3',null]]);
                $this->restrict($db);
                $final = $this->body($api->planet($cid, '2-1'));
                $this->assertSame('final', $final['meta']['status']);
                $this->assertSame('1-3', $final['data']['holder']);
                $this->assertNull($final['data']['holder_guild_id'], 'Guildless holder contributes to no guild');
                $this->assertSame([['guild_id'=>'0-2','supporter_count'=>'2']], $final['data']['guild_coverage']);
                $db->executeStatement('RESET ROLE');
                $this->block($db, $chain, 1006, [['member','1-3','0-1'], ['raid','1-4','0-3','2-1',127]]);
                $this->restrict($db);
                $after = $this->body($api->planet($cid, '2-1'));
                $this->assertSame($final['data'], $after['data']);
                $this->assertSame('1005', $after['meta']['height']);
                $this->assertSame('1006', $after['meta']['source_height']);
                $db->executeStatement('RESET ROLE');
                $db->fetchOne('SELECT structs.influence_rebuild(:c)', ['c' => $cid]);
                $this->restrict($db);
                $rebuilt = $this->body($api->planet($cid, '2-1'));
                $this->assertNotSame($final['meta']['build_id'], $rebuilt['meta']['build_id']);
                $this->assertSame($final['data'], $rebuilt['data']);
                $db->executeStatement('RESET ROLE');
            }
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testPlanetCoverageBudgetNeverReturnsPartialGuildLists(): void
    {
        $db = $this->database();
        try {
            [$cid, $bid] = $this->fixture($db, 'single_sector', true);
            $db->executeStatement("INSERT INTO structs.influence_guild_planet_win
                SELECT :b,'0-'||(200000+g),'2-1',1 FROM generate_series(1,10000) g", ['b'=>$bid]);
            $this->restrict($db); $api = new InfluenceManager($db);
            $overflow = $this->body($api->planets($cid, ['planet_ids'=>'2-999,2-1']), 422);
            $this->assertNull($overflow['data']);
            $this->body($api->planet($cid, '2-1'), 422);
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("DELETE FROM structs.influence_guild_planet_win WHERE build_id=:b AND guild='0-210000'", ['b'=>$bid]);
            $this->restrict($db);
            $this->assertCount(10000, $this->body($api->planet($cid, '2-1'))['data']['guild_coverage']);
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testVerifiedRollupsPartialEdgesAndCheckpointOpeningMatchRaw(): void
    {
        $db = $this->database();
        try {
            [$cid, $bid] = $this->fixture($db, 'planet_sectors', false, 900);
            $db->commit(); // Timescale refresh is a top-level operation on this disposable clone.
            $api = new InfluenceManager($db);
            $queries = [
                ['start_height' => '999', 'end_height' => '2505', 'bucket_blocks' => '2000', 'group_by' => 'guild_sector'],
                ['start_height' => '1000', 'end_height' => '2505', 'bucket_blocks' => '1000', 'group_by' => 'guild_sector'],
                ['start_height' => '1001', 'end_height' => '2504', 'bucket_blocks' => '1200', 'group_by' => 'guild_sector'],
                ['start_height' => '2001', 'end_height' => '2505', 'bucket_blocks' => '200', 'group_by' => 'sector'],
            ];
            $raw = array_map(fn ($q) => $this->body($api->history($cid, 'contest', null, $q))['data'], $queries);
            $db->executeStatement("CALL structs.refresh_continuous_aggregate('structs.influence_score_change_1000',0::bigint,2000::bigint)");
            $db->executeStatement('INSERT INTO structs.influence_rollup_coverage VALUES(:b,2000,:b)', ['b' => $bid]);
            $db->executeStatement('INSERT INTO structs.influence_checkpoint SELECT :b,1999,guild,sector,sum(unique_delta),sum(claim_delta)
                FROM structs.influence_score_change_1000 WHERE build_id=:b AND bucket<2000 GROUP BY guild,sector', ['b' => $bid]);
            foreach ($queries as $i => $q) $this->assertSame($raw[$i], $this->body($api->history($cid, 'contest', null, $q))['data']);
            // A marker from another build must not authorize either rollups or checkpoints.
            $db->executeStatement('UPDATE structs.influence_rollup_coverage SET refreshed_revision=-1 WHERE build_id=:b', ['b' => $bid]);
            $db->executeStatement('UPDATE structs.influence_checkpoint SET unique_planets=999999 WHERE build_id=:b', ['b' => $bid]);
            foreach ($queries as $i => $q) $this->assertSame($raw[$i], $this->body($api->history($cid, 'contest', null, $q))['data']);
            $db->fetchOne('SELECT structs.influence_rebuild(:id)', ['id' => $cid]);
            foreach ($queries as $i => $q) $this->assertSame($raw[$i], $this->body($api->history($cid, 'contest', null, $q))['data']);
        } finally {
            if ($db->isTransactionActive()) $db->rollBack();
            $db->close(); // Committed synthetic history belongs only to the runner's disposable database.
        }
    }

    public function testScheduledAndEmptyContestsDoNotInventScoresOrWinners(): void
    {
        $db = $this->database();
        try {
            [$first, $bid, $chain] = $this->fixture($db, 'single_sector', true);
            $cid = (string) $db->fetchOne("SELECT structs.influence_create_contest(:chain,1001,1002,1,'single_sector')", ['chain' => $chain]);
            $api = new InfluenceManager($db);
            $this->assertSame('scheduled', $this->body($api->contest($cid))['data']['status']);
            $this->body($api->history($cid, 'contest', null, ['start_height' => '1001', 'end_height' => '1001']), 422);
            $this->block($db, $chain, 1001, []);
            $this->assertSame('active', $this->body($api->contest($cid))['data']['status']);
            $this->assertSame([false,false,false], array_column($this->body($api->standings($cid))['data'], 'is_winner'));
            $this->block($db, $chain, 1002, []);
            $rows = $this->body($api->standings($cid))['data'];
            $this->assertSame(['0','0','0'], array_column($rows, 'points'));
            $this->assertSame([false,false,false], array_column($rows, 'is_winner'));
            $this->assertSame([false,false,false], array_column($rows, 'tied_for_lead'));
            $history = $this->body($api->history($cid, 'player', '1-1', ['start_height' => '1001', 'end_height' => '1002', 'bucket_blocks' => '1']));
            $this->assertSame(['0','0'], array_column($history['data']['samples'], 'points'));
            $this->assertSame('final', $history['meta']['status']);
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testPagedReadsAndTargetedHistoryWithTenThousandPlayers(): void
    {
        $db = $this->database();
        try {
            [$cid, $bid, $chain] = $this->fixture($db);
            $db->executeStatement("INSERT INTO structs.influence_membership_history(chain_id,player,height,phase,tx_index,event_index,guild,baseline)
                SELECT :chain,'1-'||(200000+g),999,0,-1,0,'0-3',true FROM generate_series(1,10000) g", ['chain' => $chain]);
            $db->executeStatement("INSERT INTO structs.influence_member SELECT :b,'1-'||(200000+g),'0-3' FROM generate_series(1,10000) g", ['b' => $bid]);
            // Successful but ineligible raids on unrelated planets should not be
            // scanned by a player's history query or change any score.
            $db->executeStatement("INSERT INTO structs.influence_raid(chain_id,height,phase,tx_index,event_index,block_hash,block_time,
                attacker,defender,attacker_guild,defender_guild,planet,sector,attribution_complete,payload_hash,source)
                SELECT :chain,2000,2,0,g,'h2000','2026-11-11T22:00:00Z','1-4','1-4','0-3','0-3',
                '2-'||(200000+g),127,true,md5(g::text),'{}'::jsonb FROM generate_series(1,20000) g", ['chain' => $chain]);
            $db->executeStatement('INSERT INTO structs.influence_contest_planet SELECT :b,planet,sector FROM structs.influence_raid
                WHERE chain_id=:chain AND height=2000 AND event_index>0', ['b' => $bid, 'chain' => $chain]);
            $db->executeStatement('INSERT INTO structs.influence_planet_claim SELECT :b,planet,sector,chain_id,raid_id,NULL
                FROM structs.influence_raid WHERE chain_id=:chain AND height=2000 AND event_index>0', ['b' => $bid, 'chain' => $chain]);
            $db->executeStatement("INSERT INTO structs.influence_guild_planet_win SELECT :b,'0-3',planet,1
                FROM structs.influence_raid WHERE chain_id=:chain AND height=2000 AND event_index>0", ['b' => $bid, 'chain' => $chain]);
            foreach (['influence_raid','influence_member','influence_player_planet_win','influence_contest_planet',
                'influence_planet_claim','influence_guild_planet_win'] as $table) {
                $db->executeStatement('ANALYZE structs.' . $table);
            }
            $this->restrict($db); $api = new InfluenceManager($db);
            $start = microtime(true);
            $page = $this->body($api->players($cid, ['guild_id' => '0-3', 'limit' => '25', 'include_total' => '1']));
            $pageMs = (microtime(true) - $start) * 1000;
            $this->assertCount(25, $page['data']); $this->assertSame('10001', $page['total']);
            $next = $this->body($api->players($cid, ['guild_id' => '0-3', 'limit' => '25', 'include_total' => '1', 'after_id' => $page['meta']['next_after_id']]));
            $this->assertSame('9976', $next['total']);
            $this->assertEmpty(array_intersect(array_column($page['data'], 'player_id'), array_column($next['data'], 'player_id')));
            $start = microtime(true);
            $p = $this->body($api->history($cid, 'player', '1-2', ['start_height' => '1001', 'end_height' => '2505', 'bucket_blocks' => '100']));
            $historyMs = (microtime(true) - $start) * 1000;
            $this->assertSame('400', $p['data']['samples'][array_key_last($p['data']['samples'])]['points']);
            $this->assertLessThan(5000, $historyMs); $this->assertLessThan(5000, $pageMs);
            $plan = json_decode($db->fetchOne('EXPLAIN (ANALYZE, FORMAT JSON) ' . InfluenceQuery::PLAYER_HISTORY,
                ['build' => $bid, 'chain' => $chain, 'player' => '1-2', 'sector' => null,
                 'contest_start' => 1000, 'start' => 1001, 'end' => 2505, 'bucket' => 100]), true);
            $scanned = 0;
            $walk = function (array $node) use (&$walk, &$scanned): void {
                if (($node['Relation Name'] ?? '') === 'influence_raid') {
                    $scanned += (($node['Actual Rows'] ?? 0) + ($node['Rows Removed by Filter'] ?? 0)
                        + ($node['Rows Removed by Index Recheck'] ?? 0)) * ($node['Actual Loops'] ?? 0);
                }
                foreach ($node['Plans'] ?? [] as $child) $walk($child);
            };
            $walk($plan[0]['Plan']);
            $this->assertLessThan(100, $scanned, 'Personal history must not scan 20000 unrelated raid facts');

            $ids = array_merge(['2-1'], array_map(fn ($i) => '2-' . $i, range(200101, 200199)));
            $start = microtime(true);
            $planets = $this->body($api->planets($cid, ['planet_ids'=>implode(',', $ids)]));
            $planetsMs = (microtime(true) - $start) * 1000;
            $this->assertCount(100, $planets['data']);
            $this->assertSame($ids, array_column($planets['data'], 'planet_id'));
            $this->assertSame([['guild_id'=>'0-2','supporter_count'=>'3']], $planets['data'][0]['guild_coverage']);
            $this->assertLessThan(5000, $planetsMs);
            $plan = json_decode($db->fetchOne('EXPLAIN (ANALYZE, FORMAT JSON) ' . InfluenceQuery::PLANETS,
                ['build'=>$bid,'planets'=>json_encode($ids)]), true);
            $scanned = 0; $walk($plan[0]['Plan']);
            $this->assertLessThan(200, $scanned, 'Planet snapshots must seek latest raids without scanning unrelated raid history');

            fwrite(STDERR, sprintf("\nInfluence scale: 10005 players, 20007 raid facts; player page %.1f ms, personal history %.1f ms, 100 planets %.1f ms\n", $pageMs, $historyMs, $planetsMs));
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testGrassReplacementMatchesApiScoresAndHistory(): void
    {
        $canonical = function ($value) use (&$canonical) {
            if (!is_array($value)) return $value;
            if (!array_is_list($value)) ksort($value);
            return array_map($canonical, $value);
        };
        $db = $this->database();
        try {
            foreach (['planet_sectors', 'single_sector'] as $mode) {
                [$cid] = $this->fixture($db, $mode);
                $bid = (string) $db->fetchOne('SELECT structs.influence_rebuild(:c)', ['c' => $cid]);
                $frames = array_map(fn ($r) => json_decode($r['payload'], true, 512, JSON_THROW_ON_ERROR),
                    $db->fetchAllAssociative('SELECT payload::text FROM structs.influence_grass_frame WHERE contest_id=:c AND build_id=:b ORDER BY frame_id', ['c' => $cid, 'b' => $bid]));
                $api = new InfluenceManager($db);
                $scores = array_values(array_filter($frames, fn ($f) => $f['category'] === 'influence_scores'))[0];
                $standing = $this->body($api->standings($cid));
                $this->assertSame($canonical($standing['data']), $canonical($scores['data']['standings']));
                $this->assertSame($standing['meta']['sectors'], $scores['context']['sectors']);
                $this->assertSame($standing['meta']['status'], $scores['context']['status']);
                foreach (['2-1', '2-2', '2-3'] as $planet) {
                    $frame = array_values(array_filter($frames, fn ($f) => $f['category'] === 'influence_planet' && $f['data']['planet_id'] === $planet))[0];
                    $data = $this->body($api->planet($cid, $planet))['data'];
                    $this->assertSame($canonical($frame['data']), $canonical($data));
                }
                foreach (['1-1', '1-2', '1-3', '1-4', '1-5'] as $player) {
                    $frame = array_values(array_filter($frames, fn ($f) => $f['category'] === 'influence_player' && $f['data']['player_id'] === $player))[0];
                    $data = $this->body($api->player($cid, $player))['data'];
                    foreach (['player_id', 'guild_id', 'unique_planets', 'held_planets', 'points', 'overall_points', 'sectors'] as $key) {
                        $this->assertSame($canonical($data[$key]), $canonical($frame['data'][$key]));
                    }
                }
                foreach (['guild' => ['0-1', '0-2', '0-3'], 'player' => ['1-1', '1-2', '1-3', '1-4', '1-5']] as $kind => $ids) {
                    foreach ($ids as $id) {
                        $segments = array_values(array_filter($frames, fn ($f) => $f['category'] === 'influence_history' && str_ends_with($f['subject'], ".{$kind}.{$id}")));
                        $this->assertTrue($segments[array_key_last($segments)]['data']['history']['complete']);
                        $deltas = array_merge(...array_map(fn ($f) => $f['data']['history']['samples'], $segments));
                        $history = $this->body($api->history($cid, $kind, $id, ['start_height' => '1000', 'end_height' => '2505', 'bucket_blocks' => '500', 'group_by' => 'sector']));
                        foreach ($history['data']['samples'] as $sample) {
                            $u = $c = 0;
                            foreach ($deltas as $d) if ($d['sector'] === $sample['sector'] && (int) $d['height'] <= (int) $sample['height']) {
                                $u += (int) $d['unique_delta']; $c += (int) $d['claim_delta'];
                            }
                            $this->assertSame((string) $u, $sample['unique_planets']);
                            $this->assertSame((string) $c, $sample['held_planets']);
                            $this->assertSame((string) ($u * 100 + $c * 200), $sample['points']);
                        }
                    }
                }
            }
        } finally { $db->rollBack(); $db->close(); }
    }

    public function testExactLargeScoresAndUnavailableProjection(): void
    {
        $db = $this->database();
        try {
            [$cid, $bid] = $this->fixture($db, 'single_sector', true);
            $db->executeStatement("UPDATE structs.influence_guild_sector SET unique_planets=9007199254740993 WHERE build_id=:b AND guild='0-1'", ['b' => $bid]);
            $api = new InfluenceManager($db);
            $this->assertSame('900719925474099500', $this->body($api->guild($cid, '0-1'))['data']['points']);
            $db->executeStatement("UPDATE structs.influence_projection_build SET state='invalid' WHERE build_id=:b", ['b' => $bid]);
            $r = $this->body($api->standings($cid), 503);
            $this->assertFalse($r['meta']['data_ready']);
            $this->body($api->planet($cid, '2-1'), 503);
            $this->body($api->planets($cid, ['planet_ids' => '2-1']), 503);
        } finally { $db->rollBack(); $db->close(); }
    }
}
