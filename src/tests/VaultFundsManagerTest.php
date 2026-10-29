<?php

use App\Manager\ChainSnapshotManager;
use App\Manager\VaultFundsManager;
use App\Util\ExactAmount;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

class VaultFundsManagerTest extends TestCase
{
    private const string VAULT = 'structs13nwzm5dfd26ue74jr6sc39gyn3qze0rjr9l9fz';

    private function player(?bool $created = true, ?string $address = self::VAULT): array
    {
        return ['id' => '1-101', 'primary_address' => 'retained-signing-key', 'alpha' => '9999',
            '_vault_address' => $address, '_vault_account_created' => $created,
            '_vault_balance_p' => '18446744073709551616'];
    }

    private function meta(): array
    {
        return ['chain_id' => 'structstestnet-111', 'height' => '3353000', 'indexed_height' => '3353000',
            'protocol' => 'v0.22.0', 'data_ready' => true, 'transaction_ready' => true];
    }

    public function testNewBaseVaultUsesIndexedFundsWithoutHttp(): void
    {
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->never())->method('verifyChain');
        $chain->expects($this->never())->method('get');
        $player = $this->player();
        $meta = $this->meta();
        (new VaultFundsManager($chain))->apply($player, $meta);

        $this->assertSame('18446744073709551616', $player['spendable_alpha_p']);
        $this->assertSame('18446744073709', $player['alpha']);
        $this->assertSame('indexed_base_account', $player['funds_meta']['source']);
        $this->assertTrue($player['funds_meta']['ready']);
        $this->assertSame('retained-signing-key', $player['primary_address']);
        $this->assertArrayNotHasKey('_vault_balance_p', $player);
        $this->assertTrue($meta['transaction_ready']);
    }

    /** @dataProvider adoptedProvider */
    public function testAdoptedOrUnprovisionedFundsUseVerifiedSpendableCoin(?bool $created, ?string $indexedAddress, bool $provisioned, string $amount): void
    {
        $client = $this->gateway($provisioned, $amount);
        $player = $this->player($created, $indexedAddress);
        $meta = $this->meta();
        (new VaultFundsManager(new ChainSnapshotManager($client)))->apply($player, $meta);

        $this->assertTrue($player['funds_meta']['ready']);
        $this->assertSame($amount, $player['spendable_alpha_p']);
        $this->assertSame(ExactAmount::alphaDisplay($amount), $player['alpha']);
        $this->assertSame(self::VAULT, $player['vault_address']);
        $this->assertSame($provisioned, $player['funds_meta']['provisioned']);
        $this->assertSame('chain_spendable', $player['funds_meta']['source']);
        $this->assertSame(3, $client->getRequestsCount());
    }

    public static function adoptedProvider(): array
    {
        return [
            'locked portion is not spendable' => [false, self::VAULT, true, '1000001'],
            'origin not captured' => [null, self::VAULT, true, '9007199254740993'],
            'unprovisioned and prefunded' => [null, null, false, '2000001'],
            'unprovisioned empty' => [null, null, false, '0'],
            'fully locked' => [false, self::VAULT, true, '0'],
        ];
    }

    /** @dataProvider badEvidenceProvider */
    public function testIncompleteEvidenceNeverFallsBackToWealthOrZero(array $changes): void
    {
        $client = $this->gateway($changes['provisioned'] ?? true, $changes['amount'] ?? '1000000', $changes);
        $player = $this->player(false, array_key_exists('indexed_address', $changes) ? $changes['indexed_address'] : self::VAULT);
        $meta = $this->meta();
        (new VaultFundsManager(new ChainSnapshotManager($client)))->apply($player, $meta);

        $this->assertNull($player['alpha']);
        $this->assertNull($player['spendable_alpha_p']);
        $this->assertFalse($player['funds_meta']['ready']);
        $this->assertFalse($meta['transaction_ready']);
        $this->assertTrue($meta['data_ready'], 'Projection consistency is distinct from spendability');
    }

    public static function badEvidenceProvider(): array
    {
        return [
            'wrong chain' => [['chain' => 'wrong']],
            'missing height' => [['headers' => []]],
            'wrong height' => [['headers' => ['x-cosmos-block-height: 3353001']]],
            'conflicting headers' => [['headers' => ['x-cosmos-block-height: 3353000', 'grpc-metadata-x-cosmos-block-height: 3353001']]],
            'pruned' => [['status' => 500]],
            'wrong owner' => [['owner' => '1-102']],
            'wrong address' => [['address' => 'structs1' . str_repeat('q', 38)]],
            'missing indexed provisioned vault' => [['indexed_address' => null]],
            'indexed but not provisioned' => [['provisioned' => false]],
            'missing coin' => [['coin' => null]],
            'wrong denomination' => [['coin' => ['denom' => 'uguild.0-1', 'amount' => '1']]],
            'number instead of string' => [['coin' => ['denom' => 'ualpha', 'amount' => 9007199254740993]]],
            'negative amount' => [['amount' => '-1']],
            'overflow' => [['amount' => '115792089237316195423570985008687907853269984665640564039457584007913129639936']],
            'partial envelope' => [['body' => '{}']],
            'invalid JSON' => [['body' => '{']],
            'oversized response' => [['body' => str_repeat(' ', 1048577)]],
        ];
    }

    public function testLaggingIndexCannotBorrowLatestFunds(): void
    {
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->never())->method('verifyChain');
        $player = $this->player(false);
        $meta = $this->meta();
        $meta['data_ready'] = false;
        (new VaultFundsManager($chain))->apply($player, $meta);
        $this->assertNull($player['spendable_alpha_p']);
        $this->assertNull($player['alpha']);
        $this->assertFalse($meta['transaction_ready']);
    }

    public function testLegacyProtocolKeepsExistingDisplayWithoutNewQueries(): void
    {
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->never())->method('verifyChain');
        $player = $this->player(false);
        $meta = $this->meta();
        $meta['protocol'] = 'v0.21.0';
        (new VaultFundsManager($chain))->apply($player, $meta);
        $this->assertSame('9999', $player['alpha']);
        $this->assertSame('legacy_protocol', $player['funds_meta']['reason']);
        $this->assertTrue($meta['transaction_ready']);
    }

    private function gateway(bool $provisioned, string $amount, array $changes = []): MockHttpClient
    {
        return new MockHttpClient(function (string $method, string $url, array $options) use ($provisioned, $amount, $changes) {
            $this->assertSame('GET', $method);
            $this->assertSame(0, $options['max_redirects']);
            $this->assertLessThanOrEqual(3, $options['max_duration']);
            if (str_ends_with($url, '/node_info')) {
                return new MockResponse(json_encode(['default_node_info' => ['network' => $changes['chain'] ?? 'structstestnet-111']]));
            }
            $this->assertContains('x-cosmos-block-height: 3353000', $options['headers']);
            $headers = $changes['headers'] ?? ['grpc-metadata-x-cosmos-block-height: 3353000'];
            $data = str_contains($url, '/structs/vault/')
                ? ['ownerId' => $changes['owner'] ?? '1-101', 'address' => $changes['address'] ?? self::VAULT, 'provisioned' => $provisioned]
                : ['balance' => array_key_exists('coin', $changes) ? $changes['coin'] : ['denom' => 'ualpha', 'amount' => $amount]];

            return new MockResponse($changes['body'] ?? json_encode($data),
                ['http_code' => $changes['status'] ?? 200, 'response_headers' => $headers]);
        });
    }
}
