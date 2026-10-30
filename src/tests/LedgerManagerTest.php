<?php

use App\Manager\LedgerManager;
use App\Manager\TableReadManager;
use App\Tests\ApiManagerTestCase;
use App\Util\TransferSourceQuery;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Logging\DebugStack;
use Symfony\Component\HttpFoundation\Request;

class LedgerManagerTest extends ApiManagerTestCase
{
    private const string PLAYER = '1-990986';
    private const string SOURCE = 'structs1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
    private const string RECIPIENT = 'structs1pppppppppppppppppppppppppppppppppppppp';
    private const string RETAINED = 'structs1rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr';
    private const string GUILD = 'structs1ssssssssssssssssssssssssssssssssssssss';
    private const string EXTERNAL = 'structs1tttttttttttttttttttttttttttttttttttttt';
    private const string TIME = '2026-10-29T22:38:04.286225Z';

    private function source(): array
    {
        return ['chain_id' => 'structstestnet-111', 'block_height' => '3353000', 'tx_index' => '7',
            'block_time' => '2026-10-29T22:38:04.286225999Z', 'address' => self::SOURCE,
            'counterparty' => self::RECIPIENT, 'denom' => 'ualpha', 'amount_p' => '9007199254740993'];
    }

    public function testMalformedSourceCannotReadTheDatabase(): void
    {
        $invalid = [
            ['block_height' => '0'], ['block_height' => '9223372036854775808'], ['block_height' => 3353000],
            ['tx_index' => '-1'], ['tx_index' => '2147483648'], ['tx_index' => ['7']],
            ['amount_p' => '0'], ['amount_p' => 9007199254740993], ['amount_p' => '01'],
            ['amount_p' => str_repeat('9', 79)], ['denom' => 'uguild.0-1'], ['chain_id' => 'other'],
            ['block_time' => '2026-02-30T00:00:00Z'], ['block_time' => '2026-10-29T00:00:00.1234567890Z'],
            ['block_time' => '0000-01-01T00:00:00Z'],
            ['block_time' => '2026-10-29T00:00:00+01:00'], ['address' => self::SOURCE . "'"],
            ['msg_index' => '-2'], ['event_index' => '-1'], ['extra' => 'ignored'],
        ];
        foreach ($invalid as $changes) {
            $db = $this->createMock(Connection::class);
            $db->expects($this->never())->method('beginTransaction');
            $db->expects($this->never())->method('fetchAllAssociative');
            $response = (new LedgerManager($this->entityManager($db), $this->validator()))
                ->getTransferSource(self::PLAYER, array_replace($this->source(), $changes));
            $this->assertSame(400, $response->getStatusCode(), json_encode($changes));
        }
        $parsed = TransferSourceQuery::parse(self::PLAYER, $this->source());
        $this->assertSame(self::TIME, $parsed['block_time'], 'Match pgx truncation, not timestamp text rounding');
        $this->assertSame('9007199254740993', $parsed['amount_p']);
    }

    public function testTransferSourceUsesTheExistingAuthenticationBoundary(): void
    {
        self::bootKernel(['environment' => 'test']);
        $response = self::$kernel->handle(Request::create('/api/ledger/player/1-101/transfer-source'));
        $this->assertSame(401, $response->getStatusCode());
        $body = json_decode($response->getContent(), true);
        $this->assertSame('Login required', $body['errors']['authentication_error']);
    }

    public function testHistoryAndSourceReadsUnderRestrictedRole(): void
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
            $db->executeStatement("INSERT INTO structs.guild(id) VALUES('0-990986')");
            $db->executeStatement("INSERT INTO structs.player(id,primary_address,guild_id,username) VALUES
                (:player,:retained,'0-990986','LedgerSource'),('1-990985','ledger-other-primary','0-990986','LedgerRecipient')",
                ['player' => self::PLAYER, 'retained' => self::RETAINED]);
            $db->executeStatement("INSERT INTO structs.vault(owner_id,address,account_number,account_created) VALUES
                (:player,:source,0,true),('1-990985',:recipient,1,true),('0-990986',:guild,2,true)",
                ['player' => self::PLAYER, 'source' => self::SOURCE, 'recipient' => self::RECIPIENT, 'guild' => self::GUILD]);
            $db->executeStatement("INSERT INTO structs.player_address(address,player_id,status) VALUES
                (:source,:player,'approved'),(:guild,:player,'approved'),('ledger-pending',:player,'pending')",
                ['source' => self::SOURCE, 'guild' => self::GUILD, 'player' => self::PLAYER]);
            $this->boundary($db, 3353000);

            $insert = function (string $address, string $counterparty, int $txIndex, int $event, string $action = 'sent', string $amount = '9007199254740993', string $denom = 'ualpha') use ($db): string {
                return (string) $db->fetchOne("INSERT INTO structs.ledger(time,address,counterparty,amount_p,block_height,action,direction,denom,chain_id,tx_index,msg_index,event_index)
                    VALUES(:time,:address,:counterparty,:amount,3353000,:action,:direction,:denom,'structstestnet-111',:tx,-1,:event) RETURNING id",
                    ['time' => self::TIME, 'address' => $address, 'counterparty' => $counterparty, 'amount' => $amount,
                        'action' => $action, 'direction' => $action === 'received' ? 'credit' : 'debit', 'denom' => $denom, 'tx' => $txIndex, 'event' => $event]);
            };
            $sent = $insert(self::SOURCE, self::RECIPIENT, 7, 0);
            $insert(self::RECIPIENT, self::SOURCE, 7, 1, 'received');
            $retained = $insert(self::RETAINED, self::EXTERNAL, 8, 0);
            $insert(self::GUILD, self::RECIPIENT, 9, 0);
            $insert('ledger-pending', self::RECIPIENT, 10, 0);
            $insert(self::SOURCE, self::RECIPIENT, 11, 0, 'minted');
            $insert(self::SOURCE, self::RECIPIENT, 12, 0, 'sent', '1000000', 'uguild.0-990986');
            $insert(self::SOURCE, self::RECIPIENT, 13, 0, 'sent', '0');
            $selfSent = $insert(self::SOURCE, self::SOURCE, 14, 0);
            $selfReceived = $insert(self::SOURCE, self::SOURCE, 14, 1, 'received');

            $logger = new DebugStack();
            $db->getConfiguration()->setSQLLogger($logger);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new LedgerManager($this->entityManager($db), $this->validator());
            $catalog = (new TableReadManager($this->entityManager($db), $this->validator()))
                ->applyListQuery(new Request(['include_total' => '1', 'include_meta' => '1']));
            $allDenoms = $this->body($catalog->ledgerListByPlayer(self::PLAYER, 1));
            $this->assertCount(7, $allDenoms['data'], 'Vault and approved retained only, without duplicate vault attribution');
            $this->assertSame('7', (string) $allDenoms['total']);
            $this->assertSame([$selfReceived, $selfSent], array_slice(array_column($allDenoms['data'], 'id'), 0, 2));
            $this->assertContains('uguild.0-990986', array_column($allDenoms['data'], 'denom'));
            $this->assertContains('minted', array_column($allDenoms['data'], 'action'));
            $this->assertContains('0', array_column($allDenoms['data'], 'amount_p'));
            $this->assertSame('structstestnet-111', $allDenoms['data'][0]['chain_id']);
            $this->assertSame('3353000', $allDenoms['data'][0]['block_height']);
            $this->assertSame(1, $allDenoms['data'][0]['event_index']);
            $body = $this->body($manager->getTransactions(self::PLAYER, 1));
            $this->assertSame([$selfReceived, $selfSent, $retained, $sent], array_column($body['data'], 'id'));
            $this->assertSame('4', (string) $this->body($manager->countTransactions(self::PLAYER))['data']['count']);
            $this->assertSame('9007199254740993', $body['data'][0]['amount_p']);
            $this->assertSame('3353000', $body['data'][0]['block_height']);
            $this->assertTrue($body['meta']['data_ready']);
            $detail = $this->body($manager->getTransaction($sent))['data'];
            $this->assertSame('1-990985', $detail['counterparty_player_id']);
            $this->assertSame('LedgerRecipient', $detail['counterparty_username']);
            $this->assertNull($this->body($manager->getTransaction($retained))['data']['counterparty_player_id']);
            $source = $this->body($manager->getTransferSource(self::PLAYER, $this->source()));
            $this->assertTrue($source['meta']['transfer_source']['ready']);
            $this->assertSame($sent, $source['data']['id']);
            $sourceQuery = array_values(array_filter($logger->queries, static fn (array $entry) =>
                str_contains($entry['sql'], 'AND l.block_height=:block_height AND l.tx_index=:tx_index')))[0];
            $self = array_replace($this->source(), ['counterparty' => self::SOURCE, 'tx_index' => '14']);
            $this->assertSame($selfSent, $this->body($manager->getTransferSource(self::PLAYER, $self))['data']['id']);
            foreach ([['tx_index' => '8'], ['block_height' => '3352999'], ['amount_p' => '9007199254740992'],
                ['counterparty' => self::EXTERNAL], ['address' => self::GUILD], ['event_index' => '5'],
                ['block_time' => '2026-10-29T22:38:04.286226Z']] as $changes) {
                $missing = $this->body($manager->getTransferSource(self::PLAYER, array_replace($this->source(), $changes)));
                $this->assertNull($missing['data']);
                $this->assertSame('not_found', $missing['meta']['transfer_source']['reason']);
            }
            $other = $this->body($manager->getTransferSource('1-990985', $this->source()));
            $this->assertNull($other['data'], 'Source must belong to the requested player');

            $db->executeStatement('RESET ROLE');
            $insert(self::SOURCE, self::RECIPIENT, 7, 8);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $ambiguous = $this->body($manager->getTransferSource(self::PLAYER, $this->source()));
            $this->assertNull($ambiguous['data']);
            $this->assertSame('ambiguous', $ambiguous['meta']['transfer_source']['reason']);
            $specific = array_replace($this->source(), ['msg_index' => '-1', 'event_index' => '0']);
            $this->assertSame($sent, $this->body($manager->getTransferSource(self::PLAYER, $specific))['data']['id']);

            $db->executeStatement('RESET ROLE');
            // Replayed source does not add another row or change an exact match.
            $this->assertSame(0, $db->executeStatement("INSERT INTO structs.ledger(time,address,counterparty,amount_p,block_height,action,direction,denom,chain_id,tx_index,msg_index,event_index)
                SELECT time,address,counterparty,amount_p,block_height,action,direction,denom,chain_id,tx_index,msg_index,event_index
                FROM structs.ledger WHERE id=:id ON CONFLICT DO NOTHING", ['id' => $sent]));
            $pageIds = [];
            for ($i = 20; $i < 125; $i++) {
                $pageIds[] = $insert(self::RETAINED, self::EXTERNAL, $i, 0);
            }
            $db->executeStatement("INSERT INTO structs.ledger(time,address,amount_p,action,direction,denom)
                VALUES('2026-09-01',:address,1000000,'sent','debit','ualpha'),
                      ('2026-11-15',:address,1000000,'sent','debit','ualpha')", ['address' => self::EXTERNAL]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $pageOne = $this->body($manager->getTransactions(self::PLAYER, 1));
            $pageTwo = $this->body($manager->getTransactions(self::PLAYER, 2));
            $allIds = [...array_column($pageOne['data'], 'id'), ...array_column($pageTwo['data'], 'id')];
            $this->assertCount(100, $pageOne['data']);
            $this->assertCount(10, $pageTwo['data']);
            $this->assertCount(110, array_unique($allIds), 'Same-time pagination must not repeat rows');
            $this->assertSame(array_reverse($pageIds), array_slice($allIds, 0, 105));
            $this->assertSame('110', (string) $this->body($manager->countTransactions(self::PLAYER))['data']['count']);
            $empty = $this->body($manager->getTransactions(self::PLAYER, 3));
            $this->assertSame([], $empty['data']);
            $this->assertSame('3353000', $empty['meta']['height']);
            $plan = json_decode($db->fetchOne('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' . $sourceQuery['sql'], $sourceQuery['params']), true);
            $relations = [];
            $walk = function (array $node) use (&$walk, &$relations): void {
                if (isset($node['Relation Name']) && str_contains($node['Relation Name'], '_chunk')) {
                    $relations[] = $node['Relation Name'];
                }
                foreach ($node['Plans'] ?? [] as $child) $walk($child);
            };
            $walk($plan[0]['Plan']);
            $this->assertCount(1, array_unique($relations), 'Confirmed source must prune unrelated Timescale chunks');
            fwrite(STDOUT, "\nActual transfer-source query plan: " . json_encode($plan) . "\n");

            // Current ownership follows a re-registration, never stale address metadata.
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.player_address SET player_id='1-990985' WHERE address=:address", ['address' => self::RETAINED]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $this->assertSame('4', (string) $this->body($manager->countTransactions(self::PLAYER))['data']['count']);
            $db->executeStatement('RESET ROLE');
            $this->boundary($db, 3352999);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $lagging = $this->body($manager->getTransferSource(self::PLAYER, $specific));
            $this->assertSame('not_indexed', $lagging['meta']['transfer_source']['reason']);
            $this->assertNull($lagging['data']);
            $this->assertSame('v0.21.0', $lagging['meta']['protocol']);
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("DELETE FROM structs.api_refresh_state WHERE model='inventory'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $this->assertSame('indexed_state_unavailable', $this->body($manager->getTransferSource(self::PLAYER, $specific))['meta']['transfer_source']['reason']);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }

    private function boundary(Connection $db, int $height): void
    {
        $db->executeStatement('DELETE FROM structs.current_block');
        $db->executeStatement('DELETE FROM sync_state.sync_cursor');
        $db->executeStatement('DELETE FROM structs.api_refresh_state');
        $db->executeStatement("INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
            VALUES('structstestnet-111',:height,:time,:height,'current')", ['height' => $height, 'time' => self::TIME]);
        $db->executeStatement("INSERT INTO structs.current_block(chain,height,tip_height,status)
            VALUES('structstestnet-111',:height,:height,'current')", ['height' => $height]);
        $db->executeStatement("INSERT INTO structs.api_refresh_state(model,source_height,source_time,inventory_authority)
            VALUES('inventory',:height,:time,'current-claims-v1')", ['height' => $height, 'time' => self::TIME]);
        \App\Tests\ReadinessFixture::economyCoverage($db);
    }

    private function body($response): array
    {
        $this->assertSame(200, $response->getStatusCode(), $response->getContent());
        return json_decode($response->getContent(), true);
    }
}
