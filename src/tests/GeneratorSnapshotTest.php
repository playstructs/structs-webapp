<?php

use App\Manager\StructManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Request;

class GeneratorSnapshotTest extends ApiManagerTestCase
{
    public function testInvalidSelectorsDoNotReadTheDatabase(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->never())->method('beginTransaction');
        $db->expects($this->never())->method('fetchAssociative');
        $manager = new StructManager($this->entityManager($db), $this->validator());
        $this->assertSame(400, $manager->getGeneratorSnapshot('5-1!', 'source')->getStatusCode());
        $this->assertSame(400, $manager->getGeneratorSnapshot('5-1', null)->getStatusCode());
        $this->assertSame(400, $manager->getGeneratorSnapshot('5-1', 'source!')->getStatusCode());
    }

    public function testRouteRequiresAuthentication(): void
    {
        self::bootKernel();
        $response = self::$kernel->handle(Request::create('/api/struct/5-1/generator?address=source'));
        $this->assertSame(401, $response->getStatusCode());
    }

    public function testRestrictedReadPreservesStoredPowerAndExplicitPositionAbsence(): void
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
            $db->executeStatement("INSERT INTO structs.struct(id,owner,type,location_id,location_type)
                VALUES('5-990988','1-990988',20,'2-990988','planet'),('5-990989','1-990988',20,'2-990988','planet')");
            $db->executeStatement("INSERT INTO structs.infusion(destination_id,address,destination_type,player_id,owner_id,fuel_p,power_p,ratio_p,commission,generator_disabled)
                VALUES('5-990988','generatorvault','struct','1-990988','1-990988',2000000,6000000,3,0,FALSE),
                ('5-990988','generatorretained','struct','1-990988',NULL,7000000,14000000,2,0,FALSE),
                ('5-990988','generatordisabled','struct','1-990988',NULL,4000000,0,9,0,TRUE),
                ('5-990988','generatorother','struct','1-990987','1-990987',9007199254740993,9007199254740993,1,0,FALSE),
                ('5-990987','generatorvault','struct','1-990988','1-990988',123,246,2,0,FALSE)");
            $db->executeStatement('DELETE FROM structs.current_block');
            $db->executeStatement('DELETE FROM sync_state.sync_cursor');
            $db->executeStatement('DELETE FROM structs.api_refresh_state');
            $db->executeStatement("INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
                VALUES('structstestnet-111',3353000,'2026-10-30T00:00:00Z',3353000,'current')");
            $db->executeStatement("INSERT INTO structs.current_block(chain,height,tip_height,status) VALUES('structstestnet-111',3353000,3353000,'current')");
            $db->executeStatement("INSERT INTO structs.api_refresh_state(model,source_height,source_time,inventory_authority)
                VALUES('inventory',3353000,'2026-10-30T00:00:00Z','current-claims-v1')");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new StructManager($this->entityManager($db), $this->validator());
            $body = json_decode($manager->getGeneratorSnapshot('5-990988', 'generatorvault')->getContent(), true);
            $this->assertTrue($body['success']);
            $this->assertTrue($body['meta']['transaction_ready']);
            $this->assertSame('3353000', $body['meta']['height']);
            $this->assertTrue($body['data']['positions_ready']);
            $this->assertSame('9007199267740993', $body['data']['fuel_p']);
            $this->assertSame('9007199274740993', $body['data']['power_p'], 'Sum applied power, without re-pricing retained or disabled fuel');
            $this->assertTrue($body['data']['source_exists']);
            $this->assertSame('generatorvault', $body['data']['source_address']);
            $this->assertSame('2000000', $body['data']['source_fuel_p']);
            $this->assertSame('6000000', $body['data']['source_power_p']);
            $this->assertSame('3', $body['data']['source_ratio_p']);
            $this->assertFalse($body['data']['source_generator_disabled']);
            $this->assertSame('1-990988', $body['data']['source_recorded_owner_id']);
            $disabled = json_decode($manager->getGeneratorSnapshot('5-990988', 'generatordisabled')->getContent(), true);
            $this->assertSame('4000000', $disabled['data']['source_fuel_p']);
            $this->assertSame('0', $disabled['data']['source_power_p']);
            $this->assertTrue($disabled['data']['source_generator_disabled']);
            $this->assertSame('1-990988', $disabled['data']['source_recorded_owner_id']);
            $absent = json_decode($manager->getGeneratorSnapshot('5-990988', 'prefundedunprovisioned')->getContent(), true);
            $this->assertTrue($absent['data']['positions_ready']);
            $this->assertFalse($absent['data']['source_exists']);
            $this->assertNull($absent['data']['source_fuel_p']);
            $this->assertSame($body['data']['power_p'], $absent['data']['power_p']);
            $empty = json_decode($manager->getGeneratorSnapshot('5-990989', 'generatorvault')->getContent(), true);
            $this->assertTrue($empty['data']['positions_ready']);
            $this->assertSame('0', $empty['data']['fuel_p']);
            $this->assertSame('0', $empty['data']['power_p']);
            $missing = json_decode($manager->getGeneratorSnapshot('5-990986', 'generatorvault')->getContent(), true);
            $this->assertNull($missing['data'], 'An absent struct cannot become a known empty generator');

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.infusion SET power_p=NULL WHERE address='generatorother'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $incomplete = json_decode($manager->getGeneratorSnapshot('5-990988', 'generatorvault')->getContent(), true);
            $this->assertFalse($incomplete['data']['positions_ready'], 'NULL cannot silently disappear from a complete power total');
            $this->assertNull($incomplete['data']['power_p']);
            $this->assertNull($incomplete['data']['fuel_p']);
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.infusion SET power_p=9007199254740993,destination_type='reactor' WHERE address='generatorother'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $invalid = json_decode($manager->getGeneratorSnapshot('5-990988', 'generatorvault')->getContent(), true);
            $this->assertFalse($invalid['data']['positions_ready'], 'A wrong-type row cannot silently disappear from the selected destination');
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.infusion SET destination_type='struct' WHERE address='generatorother'");
            $db->executeStatement('UPDATE structs.api_refresh_state SET source_height=3352999');
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $lag = json_decode($manager->getGeneratorSnapshot('5-990988', 'generatorvault')->getContent(), true);
            $this->assertFalse($lag['meta']['data_ready']);
            $this->assertFalse($lag['meta']['transaction_ready']);
            $db->executeStatement('RESET ROLE');
            $db->executeStatement('UPDATE sync_state.sync_cursor SET last_height=3352999,tip_height=3352999');
            $db->executeStatement('UPDATE structs.current_block SET height=3352999,tip_height=3352999');
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $legacy = json_decode($manager->getGeneratorSnapshot('5-990988', 'generatorretained')->getContent(), true);
            $this->assertSame('v0.21.0', $legacy['meta']['protocol']);
            $this->assertTrue($legacy['meta']['transaction_ready']);
            $this->assertSame('7000000', $legacy['data']['source_fuel_p']);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
