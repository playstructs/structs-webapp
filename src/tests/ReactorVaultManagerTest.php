<?php

use App\Manager\ChainSnapshotManager;
use App\Manager\InfusionManager;
use App\Manager\ReactorVaultManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

class ReactorVaultManagerTest extends ApiManagerTestCase
{
    public const string VAULT = 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz';
    public const string RETAINED = 'structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a';
    public const string VALIDATOR = 'structsvaloper1pqyqszqgpqyqszqgpqyqszqgpqyqszqg75prxl';

    public static function meta(): array
    {
        return ['chain_id' => 'structstestnet-111', 'height' => '3353000', 'indexed_height' => '3353000',
            'protocol' => 'v0.22.0', 'cache_epoch' => 'structs-api-v1:v0.22.0', 'inventory_authority' => 'current-claims-v1',
            'data_ready' => true, 'transaction_ready' => true];
    }

    private function reactor(): array
    {
        return ['owner_id' => '1-101', 'player_id' => '1-101', 'destination_id' => '3-101',
            'validator' => self::VALIDATOR, 'vault_address' => null, 'fuel_p' => null, 'defusing_p' => null,
            'power_p' => '3', 'owner_power_p' => '1',
            'positions_meta' => ['height' => '3353000', 'complete' => false, 'power_ready' => true,
                'reason' => 'vault_unindexed', 'eligibility_checked' => false, 'address_limit' => 1024],
            'positions' => [['address' => self::RETAINED, 'owner_id' => '1-101', 'validator' => self::VALIDATOR,
                'is_vault' => false, 'native_ready' => true, 'power_ready' => true,
                'fuel_p' => '9007199254740993', 'defusing_p' => '7', 'power_p' => '3', 'owner_power_p' => '1']]];
    }

    private function stored(array $changes = []): array
    {
        return array_replace(['has_infusion' => false, 'claimed' => false, 'destination_type' => null,
            'recorded_owner_id' => null, 'fuel_p' => null, 'defusing_p' => null, 'power_p' => null,
            'ratio_p' => null, 'commission' => null], $changes);
    }

    public static function nativeResponse(string $path): array
    {
        if (str_ends_with($path, '/node_info')) {
            return ['default_node_info' => ['network' => 'structstestnet-111']];
        }
        if (str_starts_with($path, '/structs/vault/')) {
            return ['ownerId' => '1-101', 'address' => self::VAULT, 'provisioned' => false];
        }
        if (str_contains($path, '/unbonding_delegations')) {
            return ['unbonding_responses' => [['delegator_address' => self::VAULT, 'validator_address' => self::VALIDATOR,
                'entries' => [['balance' => '9'], ['balance' => '0', 'unbonding_on_hold_ref_count' => '1']]]],
                'pagination' => ['next_key' => null]];
        }
        return ['delegation_responses' => [['delegation' => ['delegator_address' => self::VAULT,
            'validator_address' => self::VALIDATOR, 'shares' => '100.000000000000000001'],
            'balance' => ['denom' => 'ualpha', 'amount' => '9007199254740995']]], 'pagination' => ['next_key' => '']];
    }

    private function fixture(array $changes = []): array
    {
        $active = false;
        $meta = $changes['meta'] ?? self::meta();
        $reactor = $changes['reactor'] ?? $this->reactor();
        $db = $this->createMock(Connection::class);
        $db->method('isTransactionActive')->willReturnCallback(function () use (&$active) { return $active; });
        $db->method('beginTransaction')->willReturnCallback(function () use (&$active) { $this->assertFalse($active); $active = true; return true; });
        $db->method('commit')->willReturnCallback(function () use (&$active) { $this->assertTrue($active); $active = false; return true; });
        $db->method('rollBack')->willReturnCallback(function () use (&$active) { $active = false; return true; });
        $reads = 0;
        $db->method('fetchAssociative')->willReturnCallback(function ($sql) use ($meta, $changes, &$reads) {
            if (str_contains($sql, 'api_readiness')) {
                $reads++;
                return ['meta' => json_encode($reads > 1 ? ($changes['later_meta'] ?? $meta) : $meta)];
            }
            $this->assertStringContainsString('LEFT JOIN structs.infusion', $sql);
            return $changes['stored'] ?? $this->stored();
        });
        $db->method('fetchOne')->willReturn(json_encode($reactor));
        $requests = [];
        $http = new MockHttpClient(function ($method, $url, $options) use (&$active, &$requests, $changes) {
            $this->assertFalse($active, 'No HTTP request may keep a SQL snapshot open');
            $this->assertLessThanOrEqual(3.0, $options['max_duration']);
            $this->assertGreaterThan(0, $options['max_duration']);
            $path = parse_url($url, PHP_URL_PATH);
            $requests[] = $url;
            if (!str_ends_with($path, '/node_info')) {
                $this->assertContains('x-cosmos-block-height: 3353000', $options['headers']);
            }
            $data = self::nativeResponse($path);
            if (isset($changes['response'])) {
                $data = $changes['response']($path, $data, $url);
            }
            return new MockResponse(json_encode($data), ['http_code' => $changes['status'] ?? 200,
                'response_headers' => $changes['headers'] ?? ['x-cosmos-block-height: 3353000']]);
        });
        $manager = new InfusionManager($this->entityManager($db), $this->validator(), new ReactorVaultManager(new ChainSnapshotManager($http)));
        $body = json_decode($manager->getInfusionByPlayerId('1-101')->getContent(), true);
        return [$body, $requests];
    }

    public function testCompleteNativeAndStoredEvidenceEnablesExistingAggregate(): void
    {
        [$body, $requests] = $this->fixture();
        $this->assertTrue($body['meta']['transaction_ready']);
        $this->assertTrue($body['data']['positions_meta']['complete']);
        $this->assertFalse($body['data']['positions_meta']['vault_provisioned']);
        $this->assertSame('chain_snapshot', $body['data']['positions_meta']['vault_source']);
        $this->assertFalse($body['data']['positions_meta']['eligibility_checked']);
        $this->assertSame('18014398509481988', $body['data']['fuel_p']);
        $this->assertSame('16', $body['data']['defusing_p']);
        $this->assertSame('3', $body['data']['power_p']);
        $this->assertSame('1', $body['data']['owner_power_p']);
        $this->assertSame(self::VAULT, $body['data']['positions'][0]['address']);
        $this->assertSame(2, $body['data']['positions'][0]['unbonding_entries']);
        $this->assertNull($body['data']['positions'][0]['stored_fuel_p']);
        $this->assertCount(4, $requests);
    }

    public function testEmptyNativePagesProveAbsenceWithoutInventingAStoredRow(): void
    {
        [$body] = $this->fixture(['response' => static function ($path, $data) {
            foreach (['delegation_responses', 'unbonding_responses'] as $field) {
                if (isset($data[$field])) { $data[$field] = []; }
            }
            return $data;
        }]);
        $this->assertTrue($body['meta']['transaction_ready']);
        $this->assertSame('9007199254740993', $body['data']['fuel_p']);
        $this->assertSame('0', $body['data']['positions'][0]['fuel_p']);
        $this->assertSame('0', $body['data']['positions'][0]['power_p']);
    }

    public function testStoredAppliedPowerAndCommissionRemainSeparateFromNativeStake(): void
    {
        foreach (['1' => '2', '3' => '2', '9007199254740995' => '4503599627370498'] as $power => $ownerPower) {
            [$body] = $this->fixture(['stored' => $this->stored(['has_infusion' => true, 'destination_type' => 'reactor',
                'recorded_owner_id' => '1-101', 'fuel_p' => '8000000', 'defusing_p' => '999',
                'power_p' => (string) $power, 'ratio_p' => '1', 'commission' => '0.5'])]);
            $this->assertTrue($body['meta']['transaction_ready']);
            $this->assertSame($ownerPower, $body['data']['owner_power_p']);
            $this->assertSame('16', $body['data']['defusing_p']);
        }
    }

    public function testEmptyIntermediatePageAndCursorAreFollowed(): void
    {
        [$body, $requests] = $this->fixture(['response' => static function ($path, $data, $url) {
            parse_str(parse_url($url, PHP_URL_QUERY) ?? '', $query);
            if (isset($data['delegation_responses']) && ($query['pagination_key'] ?? '') === '') {
                return ['delegation_responses' => [], 'pagination' => ['next_key' => 'a+/=']];
            }
            return $data;
        }]);
        $this->assertTrue($body['meta']['transaction_ready']);
        $this->assertCount(5, $requests);
        $this->assertStringContainsString('a%2B%2F%3D', $requests[3]);
    }

    public function testIncompleteOrConflictingEvidenceNeverPublishesPartialTotals(): void
    {
        $cases = [
            ['headers' => []], ['headers' => ['x-cosmos-block-height: 3353001']], ['status' => 500],
            ['later_meta' => array_replace(self::meta(), ['height' => '3353001'])],
            ['stored' => $this->stored(['claimed' => true])],
            ['stored' => $this->stored(['has_infusion' => true, 'recorded_owner_id' => '1-999'])],
        ];
        foreach (['vault', 'shares', 'denom', 'owner', 'amount', 'missing', 'repeat', 'overflow', 'duplicate'] as $failure) {
            $cases[] = ['response' => static function ($path, $data, $url) use ($failure) {
                if ($failure === 'vault' && isset($data['provisioned'])) { $data['provisioned'] = true; }
                if (isset($data['delegation_responses'])) {
                    switch ($failure) {
                        case 'shares': $data['delegation_responses'][0]['delegation']['shares'] = '0'; break;
                        case 'denom': $data['delegation_responses'][0]['balance']['denom'] = 'other'; break;
                        case 'owner': $data['delegation_responses'][0]['delegation']['delegator_address'] = self::RETAINED; break;
                        case 'amount': $data['delegation_responses'][0]['balance']['amount'] = 9007199254740995; break;
                        case 'missing': unset($data['pagination']); break;
                        case 'repeat': $data['pagination']['next_key'] = 'loop'; break;
                        case 'overflow': $data['pagination']['next_key'] = hash('sha256', $url); break;
                        case 'duplicate': $data['delegation_responses'][] = $data['delegation_responses'][0]; break;
                    }
                }
                return $data;
            }];
        }
        $retained = $this->reactor();$retained['positions'][0]['native_ready'] = false;
        $cases[] = ['reactor' => $retained];
        foreach ($cases as $changes) {
            [$body, $requests] = $this->fixture($changes);
            $this->assertFalse($body['meta']['transaction_ready']);
            $this->assertFalse($body['data']['positions_meta']['complete']);
            $this->assertFalse($body['data']['positions_meta']['power_ready']);
            $this->assertNull($body['data']['fuel_p']);
            $this->assertNull($body['data']['power_p']);
            $this->assertNull($body['data']['vault_address']);
            $this->assertCount(1, $body['data']['positions']);
            $this->assertLessThanOrEqual(6, count($requests), 'Bounded queries cannot return truncated coverage');
        }
    }

    public function testExpiredNativeBudgetStartsNoRequest(): void
    {
        $http = new MockHttpClient(fn () => $this->fail('Expired work reached HTTP'));
        $this->expectException(UnexpectedValueException::class);
        (new ChainSnapshotManager($http))->get('/structs/vault/1-101', '3353000', hrtime(true) / 1e9 - 1);
    }

    public function testRestrictedSqlAndNativeEvidenceCompleteOneUnprovisionedOwner(): void
    {
        if (!$url = getenv('INTEGRATION_DATABASE_URL')) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $owner = '1-991087';
        $source = 'structs1tdd4kk6mtdd4kk6mtdd4kk6mtdd4kk6mmxxfzx';
        $retained = 'structs1t3w9chzut3w9chzut3w9chzut3w9chzumkpv96';
        $validator = 'structsvaloper1t4w46h2at4w46h2at4w46h2at4w46h2aucm8a5';
        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
            $db->executeStatement("INSERT INTO structs.guild(id,primary_reactor_id) VALUES('0-991087','3-991087')");
            $db->executeStatement("INSERT INTO structs.reactor(id,validator,default_commission) VALUES('3-991087',?,0.5)", [$validator]);
            $db->executeStatement("INSERT INTO structs.player(id,primary_address,guild_id) VALUES(?,?,'0-991087')", [$owner, $retained]);
            $db->executeStatement("INSERT INTO structs.infusion(destination_id,address,destination_type,player_id,owner_id,fuel_p,defusing_p,power_p,ratio_p,commission)
                VALUES('3-991087',?,'reactor',?,?,8000000,999,3,1,0.5)", [$retained, $owner, $owner]);
            foreach (['structs.current_block', 'sync_state.sync_cursor', 'structs.api_refresh_state'] as $table) {
                $db->executeStatement('DELETE FROM ' . $table);
            }
            $db->executeStatement("INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
                VALUES('structstestnet-111',3353000,'2026-10-30T02:00:00Z',3353000,'current')");
            $db->executeStatement("INSERT INTO structs.current_block(chain,height,tip_height,status) VALUES('structstestnet-111',3353000,3353000,'current')");
            $db->executeStatement("INSERT INTO structs.api_refresh_state(model,source_height,source_time,inventory_authority)
                VALUES('inventory',3353000,'2026-10-30T02:00:00Z','current-claims-v1')");
            $db->executeStatement("INSERT INTO sync_state.native_staking_snapshot
                (chain_id,address,required_height,source_height,bonded,unbonding,fetched_at,positions_complete)
                VALUES('structstestnet-111',?,3353000,3353000,9007199254740993,7,NOW(),TRUE)", [$retained]);
            $db->executeStatement("INSERT INTO sync_state.native_staking_position(chain_id,address,validator,bonded,unbonding,unbonding_entries)
                VALUES('structstestnet-111',?,?,9007199254740993,7,1)", [$retained, $validator]);
            $requests = 0;
            $http = new MockHttpClient(function ($method, $url) use ($owner, $source, $validator, $db, &$requests) {
                $requests++;
                // The outer fixture transaction owns rollback; the API must not add one around HTTP.
                $this->assertSame(1, $db->getTransactionNestingLevel());
                $data = str_replace([self::VAULT, self::VALIDATOR, '1-101'], [$source, $validator, $owner],
                    json_encode(self::nativeResponse(parse_url($url, PHP_URL_PATH))));
                return new MockResponse($data, ['response_headers' => ['x-cosmos-block-height: 3353000']]);
            });
            \App\Tests\ReadinessFixture::economyCoverage($db);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new InfusionManager($this->entityManager($db), $this->validator(), new ReactorVaultManager(new ChainSnapshotManager($http)));
            $body = json_decode($manager->getInfusionByPlayerId($owner)->getContent(), true);
            $this->assertTrue($body['meta']['transaction_ready']);
            $this->assertSame('18014398509481988', $body['data']['fuel_p']);
            $this->assertSame('16', $body['data']['defusing_p']);
            $this->assertSame('1', $body['data']['owner_power_p']);
            $this->assertSame($source, $body['data']['positions'][0]['address']);
            $this->assertSame(4, $requests);
            $this->assertSame(0, (int) $db->fetchOne('SELECT count(*) FROM structs.vault WHERE owner_id=?', [$owner]));
            $this->assertSame(0, (int) $db->fetchOne('SELECT count(*) FROM structs.player_address WHERE address=?', [$source]));
            if ($path = getenv('STRUCTS_REACTOR_VAULT_FIXTURE')) {
                file_put_contents($path, json_encode($body, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n");
            }

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("INSERT INTO structs.infusion(destination_id,address,destination_type,player_id,owner_id,fuel_p,defusing_p,power_p,ratio_p,commission)
                VALUES('3-991087',?,'reactor',?,?,1000000,777,3,1,0.5)", [$source, $owner, $owner]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $stored = json_decode($manager->getInfusionByPlayerId($owner)->getContent(), true);
            $this->assertTrue($stored['meta']['transaction_ready']);
            $this->assertSame('6', $stored['data']['power_p']);
            $this->assertSame('2', $stored['data']['owner_power_p']);
            $this->assertSame('16', $stored['data']['defusing_p'], 'Stored cooldown cannot replace native unbonding');
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
