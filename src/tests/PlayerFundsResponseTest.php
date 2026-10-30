<?php

use App\Manager\ChainSnapshotManager;
use App\Manager\PlayerManager;
use App\Manager\VaultFundsManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Request;

class PlayerFundsResponseTest extends ApiManagerTestCase
{
    public function testPlayerFallbackRunsAfterTheDatabaseSnapshotCloses(): void
    {
        $committed = false;
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())->method('commit')->willReturnCallback(function () use (&$committed) {
            $committed = true;
            return true;
        });
        $meta = ['chain_id' => 'structstestnet-111', 'height' => '3353000', 'indexed_height' => '3353000',
            'protocol' => 'v0.22.0', 'data_ready' => true, 'transaction_ready' => true];
        $address = 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz';
        $db->expects($this->exactly(2))->method('fetchAssociative')->willReturnOnConsecutiveCalls(
            ['id' => '1-101', 'alpha' => '99', '_vault_address' => $address, '_vault_account_created' => false, '_vault_balance_p' => '99000000'],
            ['meta' => json_encode($meta)]
        );
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->once())->method('verifyChain')->willReturnCallback(function () use (&$committed) {
            $this->assertTrue($committed, 'HTTP must not keep the SQL snapshot open');
        });
        $chain->expects($this->exactly(2))->method('get')->willReturnOnConsecutiveCalls(
            ['ownerId' => '1-101', 'address' => $address, 'provisioned' => true],
            ['balance' => ['denom' => 'ualpha', 'amount' => '1000001']]
        );
        $response = (new PlayerManager($this->entityManager($db), $this->validator(), new VaultFundsManager($chain)))->getPlayer('1-101');
        $body = json_decode($response->getContent(), true);
        $this->assertSame('1', $body['data']['alpha']);
        $this->assertSame('1000001', $body['data']['spendable_alpha_p']);
        $this->assertSame('3353000', $body['data']['funds_meta']['height']);
        $this->assertTrue($body['meta']['transaction_ready']);
    }

    /** Actual player/search SQL under webapp grants, including large raw values. */
    public function testRestrictedReadsSeparateVaultFundsFromOwnedWealth(): void
    {
        $url = getenv('INTEGRATION_DATABASE_URL');
        if (!$url) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            // SET ROLE does not apply the login role's configured search_path.
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
            $db->executeStatement("INSERT INTO structs.guild(id) VALUES('0-990988')");
            $db->executeStatement("INSERT INTO structs.player(id,primary_address,guild_id,username)
                VALUES('1-990988','funds-retained-primary','0-990988','FundsFixture')");
            $db->executeStatement("INSERT INTO structs.vault(owner_id,address,account_number,account_created)
                VALUES('1-990988','funds-player-vault',0,true),('0-990988','funds-guild-vault',1,true)");
            $db->executeStatement("INSERT INTO structs.api_inventory(owner_type,owner_id,denom,balance) VALUES
                ('address','funds-player-vault','ualpha',9007199254740993),
                ('address','funds-retained-primary','ualpha',50000000000000000000),
                ('address','funds-guild-vault','ualpha',80000000000000000000),
                ('player','1-990988','ualpha',50009007199254740993),
                ('player','1-990988','ualpha.infused',NULL)");
            $db->executeStatement('DELETE FROM structs.current_block');
            $db->executeStatement('DELETE FROM sync_state.sync_cursor');
            $db->executeStatement('DELETE FROM structs.api_refresh_state');
            $db->executeStatement("INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
                VALUES('structstestnet-111',3353000,'2026-10-29T12:00:00Z',3353000,'current')");
            $db->executeStatement("INSERT INTO structs.current_block(chain,height,tip_height,status)
                VALUES('structstestnet-111',3353000,3353000,'current')");
            $db->executeStatement("INSERT INTO structs.api_refresh_state(model,source_height,source_time,inventory_authority)
                VALUES('inventory',3353000,'2026-10-29T12:00:00Z','current-claims-v1')");
            \App\Tests\ReadinessFixture::economyCoverage($db);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $chain = $this->createMock(ChainSnapshotManager::class);
            $chain->expects($this->never())->method('verifyChain');
            $manager = new PlayerManager($this->entityManager($db), $this->validator(), new VaultFundsManager($chain));
            $body = json_decode($manager->getPlayer('1-990988')->getContent(), true);
            $this->assertTrue($body['success']);
            $this->assertSame('9007199254740993', $body['data']['spendable_alpha_p']);
            $this->assertSame('9007199254', $body['data']['alpha']);
            $this->assertSame('funds-retained-primary', $body['data']['primary_address']);
            $this->assertTrue($body['data']['funds_meta']['ready'], 'Unknown native value does not block liquid funds');
            $this->assertTrue($body['meta']['data_ready']);
            $this->assertSame(1, (int) $db->fetchOne("SELECT count(*) FROM structs.player_address WHERE player_id='1-990988'"));

            $search = json_decode($manager->transferSearch(Request::create('/api/player/transfer/search?search_string=FundsFixture'))->getContent(), true);
            $this->assertCount(1, $search['data']);
            $this->assertSame('9007199254740993', $search['data'][0]['spendable_alpha_p']);
            $this->assertSame('funds-retained-primary', $search['data'][0]['address'], 'Search still identifies the approved player');
            $this->assertSame('funds-player-vault', $search['data'][0]['vault_address']);
            $this->assertSame('3353000', $search['meta']['height']);

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.vault SET account_created=false WHERE owner_id='1-990988'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $search = json_decode($manager->transferSearch(Request::create('/api/player/transfer/search?search_string=FundsFixture'))->getContent(), true);
            $this->assertNull($search['data'][0]['alpha']);
            $this->assertNull($search['data'][0]['spendable_alpha_p']);
            $this->assertFalse($search['data'][0]['funds_meta']['ready']);
            $this->assertTrue($search['meta']['data_ready']);

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("DELETE FROM structs.api_refresh_state WHERE model='inventory'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $body = json_decode($manager->getPlayer('1-990988')->getContent(), true);
            $this->assertNull($body['data']['alpha']);
            $this->assertNull($body['data']['spendable_alpha_p']);
            $this->assertFalse($body['meta']['transaction_ready']);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
