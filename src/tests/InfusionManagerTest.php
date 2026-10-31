<?php

use App\Manager\InfusionManager;
use App\Manager\TableReadManager;
use App\Tests\ApiManagerTestCase;
use App\Tests\ReadinessFixture;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Request;

class InfusionManagerTest extends ApiManagerTestCase
{
    public function testInvalidPlayerDoesNotReadTheDatabase(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->never())
            ->method('beginTransaction');
        $db->expects($this->never())
            ->method('fetchOne');
        $db->expects($this->never())
            ->method('fetchAssociative');
        $response = (new InfusionManager($this->entityManager($db), $this->validator()))
            ->getInfusionByPlayerId('1-1!');
        $this->assertSame(400, $response->getStatusCode());
    }

    public function testUnknownPositionsWithholdTransactionsWithoutChangingProjectionReadiness(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())
            ->method('fetchAssociative')
            ->willReturn([
                'meta' => json_encode([
                    'height' => '3353000',
                    'protocol' => 'v0.22.0',
                    'data_ready' => true,
                    'transaction_ready' => true,
                ]),
            ]);
        $db->expects($this->once())
            ->method('fetchOne')
            ->willReturn(json_encode([
                'fuel_p' => null,
                'defusing_p' => null,
                'power_p' => '9007199254740993',
                'positions_meta' => ['complete' => false, 'power_ready' => true],
                'positions' => [],
            ]));
        $body = json_decode(
            (new InfusionManager($this->entityManager($db), $this->validator()))
                ->getInfusionByPlayerId('1-1')
                ->getContent(),
            true
        );
        $this->assertTrue($body['meta']['data_ready']);
        $this->assertFalse($body['meta']['transaction_ready']);
        $this->assertNull($body['data']['fuel_p']);
        $this->assertSame('9007199254740993', $body['data']['power_p']);
    }

    public function testRestrictedEndpointReturnsAllPositionsAndKeepsLegacyPathBeforeH(): void
    {
        $url = getenv('INTEGRATION_DATABASE_URL');
        if (!$url) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");

            // Fixtures: a player with vault and retained reactor infusions, plus
            // a guild-owned infusion on another reactor.
            $db->executeStatement("INSERT INTO structs.guild(id,primary_reactor_id) VALUES('0-990987','3-990987')");
            $db->executeStatement(
                "INSERT INTO structs.reactor(id,validator,default_commission)
                VALUES('3-990987','reactor-api-validator',0.5)"
            );
            $db->executeStatement(
                "INSERT INTO structs.player(id,primary_address,guild_id)
                VALUES('1-990987','reactor-api-retained','0-990987')"
            );
            $db->executeStatement(
                "INSERT INTO structs.vault(owner_id,address,account_number)
                VALUES('1-990987','reactor-api-vault',0)"
            );
            $db->executeStatement(
                "INSERT INTO structs.infusion(destination_id,address,destination_type,player_id,owner_id,fuel_p,defusing_p,power_p,ratio_p,commission)
                VALUES('3-990987','reactor-api-vault','reactor','1-990987','1-990987',1000000,999,1,1,0.5),
                ('3-990987','reactor-api-retained','reactor','1-990987',NULL,2000000,999,3,1,0.5),
                ('3-990986','reactor-api-guild','reactor','1-990987','0-990987',8000000,999,99,1,0)"
            );

            // Chain boundary and native staking snapshots at height 3353000.
            $db->executeStatement('DELETE FROM structs.current_block');
            $db->executeStatement('DELETE FROM sync_state.sync_cursor');
            $db->executeStatement('DELETE FROM structs.api_refresh_state');
            $db->executeStatement(
                "INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
                VALUES('structstestnet-111',3353000,'2026-10-29T12:00:00Z',3353000,'current')"
            );
            $db->executeStatement(
                "INSERT INTO structs.current_block(chain,height,tip_height,status)
                VALUES('structstestnet-111',3353000,3353000,'current')"
            );
            $db->executeStatement(
                "INSERT INTO structs.api_refresh_state(model,source_height,source_time,inventory_authority)
                VALUES('inventory',3353000,'2026-10-29T12:00:00Z','current-claims-v1')"
            );
            $db->executeStatement(
                "INSERT INTO sync_state.native_staking_snapshot
                (chain_id,address,required_height,source_height,bonded,unbonding,fetched_at,positions_complete)
                VALUES('structstestnet-111','reactor-api-vault',3353000,3353000,9007199254740993,0,NOW(),TRUE),
                ('structstestnet-111','reactor-api-retained',3353000,3353000,7,0,NOW(),TRUE)"
            );
            $db->executeStatement(
                "INSERT INTO sync_state.native_staking_position(chain_id,address,validator,bonded,unbonding,unbonding_entries)
                VALUES('structstestnet-111','reactor-api-vault','reactor-api-validator',9007199254740993,0,0),
                ('structstestnet-111','reactor-api-retained','reactor-api-validator',7,0,1)"
            );
            ReadinessFixture::economyCoverage($db);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');

            $manager = new InfusionManager($this->entityManager($db), $this->validator());
            $body = json_decode($manager->getInfusionByPlayerId('1-990987')->getContent(), true);
            $this->assertTrue($body['success']);
            $this->assertSame('3353000', $body['meta']['height']);
            $this->assertTrue($body['meta']['transaction_ready']);
            $this->assertSame('9007199254741000', $body['data']['fuel_p']);
            $this->assertSame(
                '0',
                $body['data']['defusing_p'],
                'Delayed stored cooldown must not revive completed native claims'
            );
            $this->assertSame('4', $body['data']['power_p']);
            $this->assertSame('2', $body['data']['owner_power_p']);
            $this->assertNull($body['data']['address'], 'An aggregate cannot claim a single debit address');
            $this->assertCount(2, $body['data']['positions']);
            $this->assertSame('reactor-api-vault', $body['data']['positions'][0]['address']);
            $this->assertFalse($body['data']['positions_meta']['eligibility_checked']);
            $missing = json_decode($manager->getInfusionByPlayerId('1-0')->getContent(), true);
            $this->assertNull($missing['data']);
            $this->assertFalse($missing['meta']['transaction_ready']);

            // Raw catalog rows retain their stored meaning, expose v0.22 fields,
            // and filter/count by effective recorded owner, not stale player_id.
            $catalog = (new TableReadManager($this->entityManager($db), $this->validator()))
                ->applyListQuery(Request::create('/?include_total=1'));
            $raw = json_decode($catalog->infusionByPlayerList('1-990987', 1)->getContent(), true);
            $this->assertSame(2, $raw['total']);
            $this->assertCount(2, $raw['data']);
            $this->assertArrayHasKey('owner_id', $raw['data'][0]);
            $this->assertArrayHasKey('generator_disabled', $raw['data'][0]);
            $this->assertSame('999', $raw['data'][0]['defusing_p']);

            // An incomplete native snapshot withholds transactions but not data.
            $db->executeStatement('RESET ROLE');
            $db->executeStatement(
                "UPDATE sync_state.native_staking_snapshot
                SET positions_complete=FALSE
                WHERE address='reactor-api-retained'"
            );
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $body = json_decode($manager->getInfusionByPlayerId('1-990987')->getContent(), true);
            $this->assertNull($body['data']['fuel']);
            $this->assertFalse($body['meta']['transaction_ready']);
            $this->assertTrue($body['meta']['data_ready']);

            // Below the v0.22 boundary the legacy single-position shape applies.
            $db->executeStatement('RESET ROLE');
            $db->executeStatement('UPDATE sync_state.sync_cursor SET last_height=3352999,tip_height=3352999');
            $db->executeStatement('UPDATE structs.current_block SET height=3352999,tip_height=3352999');
            $db->executeStatement('UPDATE structs.api_refresh_state SET source_height=3352999');
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $body = json_decode($manager->getInfusionByPlayerId('1-990987')->getContent(), true);
            $this->assertSame('v0.21.0', $body['meta']['protocol']);
            $this->assertSame('3352999', $body['meta']['height']);
            $this->assertArrayNotHasKey('positions', $body['data']);
            $this->assertSame('2', $body['data']['fuel'], 'Legacy actions still debit only the primary position');
            $this->assertSame('reactor-api-retained', $body['data']['address']);
            $this->assertSame('2000000', $body['data']['fuel_p']);
            $this->assertSame('3', $body['data']['power_p']);
            $this->assertSame('999', $body['data']['defusing_p']);
            $this->assertArrayHasKey('join_infusion_minimum_p', $body['data']);
            $this->assertSame('0.5', $body['data']['position_commission']);

            // Without a primary infusion the legacy shape reports zero for the primary address.
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("DELETE FROM structs.infusion WHERE address='reactor-api-retained'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $empty = json_decode($manager->getInfusionByPlayerId('1-990987')->getContent(), true);
            $this->assertSame(
                '0',
                $empty['data']['fuel_p'],
                'Another address cannot stand in for an absent primary infusion'
            );
            $this->assertSame('0', $empty['data']['power_p']);
            $this->assertSame('reactor-api-retained', $empty['data']['address']);
            $this->assertSame('3-990987', $empty['data']['destination_id']);
            $this->assertSame('1-990987', $empty['data']['player_id']);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
