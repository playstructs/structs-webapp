<?php

use App\Manager\ChainSnapshotManager;
use App\Manager\PlayerManager;
use App\Manager\VaultFundsManager;
use App\Tests\ApiManagerTestCase;
use App\Tests\ReadinessFixture;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Request;

class PlayerFundsResponseTest extends ApiManagerTestCase
{
    public function testPlayerFallbackRunsAfterTheDatabaseSnapshotCloses(): void
    {
        $committed = false;
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())
            ->method('commit')
            ->willReturnCallback(function () use (&$committed) {
                $committed = true;
                return true;
            });
        $meta = [
            'chain_id' => 'structstestnet-111',
            'height' => '3353000',
            'indexed_height' => '3353000',
            'protocol' => 'v0.22.0',
            'data_ready' => true,
            'transaction_ready' => true,
        ];
        $address = 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz';

        // The player row reports an unprovisioned vault, so funds come from the chain.
        $db->expects($this->exactly(2))
            ->method('fetchAssociative')
            ->willReturnOnConsecutiveCalls(
                [
                    'id' => '1-101',
                    'alpha' => '99',
                    '_vault_address' => $address,
                    '_vault_account_created' => false,
                    '_vault_balance_p' => '99000000',
                ],
                ['meta' => json_encode($meta)]
            );
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->once())
            ->method('verifyChain')
            ->willReturnCallback(function () use (&$committed) {
                $this->assertTrue($committed, 'HTTP must not keep the SQL snapshot open');
            });
        $chain->expects($this->exactly(2))
            ->method('get')
            ->willReturnOnConsecutiveCalls(
                ['ownerId' => '1-101', 'address' => $address, 'provisioned' => true],
                ['balance' => ['denom' => 'ualpha', 'amount' => '1000001']]
            );

        $response = (new PlayerManager($this->entityManager($db), $this->validator(), new VaultFundsManager($chain)))
            ->getPlayer('1-101');
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

            // Fixtures: a player with a vault and retained primary address, a
            // guild vault, and inventory balances above 2^53.
            $db->executeStatement("INSERT INTO structs.guild(id) VALUES('0-990988')");
            $db->executeStatement(
                "INSERT INTO structs.player(id,primary_address,guild_id,username)
                VALUES('1-990988','funds-retained-primary','0-990988','FundsFixture')"
            );
            $db->executeStatement(
                "INSERT INTO structs.vault(owner_id,address,account_number,account_created)
                VALUES('1-990988','funds-player-vault',0,true),('0-990988','funds-guild-vault',1,true)"
            );
            $db->executeStatement(
                "INSERT INTO structs.api_inventory(owner_type,owner_id,denom,balance) VALUES
                ('address','funds-player-vault','ualpha',9007199254740993),
                ('address','funds-retained-primary','ualpha',50000000000000000000),
                ('address','funds-guild-vault','ualpha',80000000000000000000),
                ('player','1-990988','ualpha',50009007199254740993),
                ('player','1-990988','ualpha.infused',NULL)"
            );

            // Chain boundary at height 3353000.
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
            ReadinessFixture::economyCoverage($db);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');

            // A provisioned vault is read from SQL without touching the chain.
            $chain = $this->createMock(ChainSnapshotManager::class);
            $chain->expects($this->never())
                ->method('verifyChain');
            $manager = new PlayerManager($this->entityManager($db), $this->validator(), new VaultFundsManager($chain));
            $body = json_decode($manager->getPlayer('1-990988')->getContent(), true);
            $this->assertTrue($body['success']);
            $this->assertSame('9007199254740993', $body['data']['spendable_alpha_p']);
            $this->assertSame('9007199254', $body['data']['alpha']);
            $this->assertSame('funds-retained-primary', $body['data']['primary_address']);
            $this->assertTrue(
                $body['data']['funds_meta']['ready'],
                'Unknown native value does not block liquid funds'
            );
            $this->assertTrue($body['meta']['data_ready']);
            $this->assertSame(
                1,
                (int) $db->fetchOne("SELECT count(*) FROM structs.player_address WHERE player_id='1-990988'")
            );

            $search = json_decode(
                $manager->transferSearch(
                    Request::create('/api/player/transfer/search?search_string=FundsFixture')
                )->getContent(),
                true
            );
            $this->assertCount(1, $search['data']);
            $this->assertSame('9007199254740993', $search['data'][0]['spendable_alpha_p']);
            $this->assertSame(
                'funds-retained-primary',
                $search['data'][0]['address'],
                'Search still identifies the approved player'
            );
            $this->assertSame('funds-player-vault', $search['data'][0]['vault_address']);
            $this->assertSame('3353000', $search['meta']['height']);

            // The real restricted SQL locates retained funds; native evidence
            // then excludes the locked portion rather than using indexed wealth.
            $retained = 'structs1qgpqyqszqgpqyqszqgpqyqszqgpqyqsz8kgukz';
            $db->executeStatement('RESET ROLE');
            $db->executeStatement(
                "UPDATE structs.api_inventory SET balance=0 WHERE owner_id='funds-retained-primary'"
            );
            $db->executeStatement(
                "INSERT INTO structs.player_address(address,player_id,status)
                VALUES(?, '1-990988', 'approved')",
                [$retained]
            );
            $db->executeStatement(
                "INSERT INTO structs.api_inventory(owner_type,owner_id,denom,balance)
                VALUES('address', ?, 'ualpha', 50000000)",
                [$retained]
            );
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $fundingChain = $this->createMock(ChainSnapshotManager::class);
            $fundingChain->expects($this->once())
                ->method('verifyChain');
            $fundingChain->expects($this->exactly(2))
                ->method('get')
                ->willReturnOnConsecutiveCalls(
                    ['address' => $retained, 'playerId' => '1-990988'],
                    ['balance' => ['denom' => 'ualpha', 'amount' => '10000000']]
                );
            $fundingManager = new PlayerManager(
                $this->entityManager($db),
                $this->validator(),
                new VaultFundsManager($fundingChain)
            );
            $funded = json_decode($fundingManager->getPlayer('1-990988')->getContent(), true)['data'];
            $this->assertSame('10000000', $funded['retained_alpha_p']);
            $this->assertTrue($funded['retained_funds_meta']['complete']);
            $this->assertSame('1', $funded['retained_funds_meta']['candidate_count']);
            $this->assertSame('9007199264740993', $funded['available_alpha_p']);
            $this->assertSame(
                [['address' => $retained, 'spendable_alpha_p' => '10000000']],
                $funded['retained_sources']
            );
            $this->assertArrayNotHasKey('_retained_funding_sources', $funded);

            // An uncreated vault account makes search funds unknown.
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.vault SET account_created=false WHERE owner_id='1-990988'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $search = json_decode(
                $manager->transferSearch(
                    Request::create('/api/player/transfer/search?search_string=FundsFixture')
                )->getContent(),
                true
            );
            $this->assertNull($search['data'][0]['alpha']);
            $this->assertNull($search['data'][0]['spendable_alpha_p']);
            $this->assertFalse($search['data'][0]['funds_meta']['ready']);
            $this->assertTrue($search['meta']['data_ready']);

            // Without inventory refresh state the player's funds are unknown.
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
