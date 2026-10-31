<?php

use App\Manager\ChainSnapshotManager;
use App\Manager\RetainedFundsManager;
use PHPUnit\Framework\TestCase;

class RetainedFundsManagerTest extends TestCase
{
    private const string SOURCE = 'structs1qgpqyqszqgpqyqszqgpqyqszqgpqyqsz8kgukz';
    private const string VAULT = 'structs1qyqszqgpqyqszqgpqyqszqgpqyqszqgpkjwea5';

    /** @dataProvider spendabilityProvider */
    public function testOnlyNativeSpendableOwnedFundsAreIncluded(string $owner, ?string $amount, ?string $expected): void
    {
        $player = $this->player();
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->once())->method('verifyChain')->with('structstestnet-111', $this->isType('float'));
        $chain->expects($this->exactly($owner === '1-1' ? 2 : 1))->method('get')
            ->willReturnCallback(function (string $path, string $height, float $deadline) use ($owner, $amount) {
                $this->assertSame('3353010', $height);
                $this->assertGreaterThan(hrtime(true) / 1e9, $deadline);
                if ($path === '/structs/address/' . self::SOURCE) {
                    return ['address' => self::SOURCE, 'playerId' => $owner];
                }
                $this->assertSame('/cosmos/bank/v1beta1/spendable_balances/' . self::SOURCE . '/by_denom?denom=ualpha', $path);
                if ($amount === null) throw new RuntimeException('Native snapshot is unavailable');
                return ['balance' => ['denom' => 'ualpha', 'amount' => $amount]];
            });
        (new RetainedFundsManager($chain))->apply($player, $this->meta(), [['address' => self::SOURCE]]);
        $this->assertSame('2000000', $player['spendable_alpha_p'], 'The vault amount keeps its existing meaning');
        $this->assertSame($expected, $player['retained_alpha_p']);
        $this->assertSame($expected === null ? '2000000' : bcadd('2000000', $expected, 0), $player['available_alpha_p']);
        $this->assertSame($expected !== null, $player['retained_funds_meta']['ready']);
        $this->assertCount($expected !== null && $expected !== '0' ? 1 : 0, $player['retained_sources']);
    }

    public static function spendabilityProvider(): array
    {
        return [
            'matured refund' => ['1-1', '50000000', '50000000'],
            'vesting returns only unlocked portion' => ['1-1', '1000000', '1000000'],
            'bonded, unbonding or fully locked' => ['1-1', '0', '0'],
            'address was reassigned' => ['1-9', '50000000', '0'],
            'unavailable is distinct from zero' => ['1-1', null, null],
            'large exact value' => ['1-1', '9007199254740993', '9007199254740993'],
        ];
    }

    /** @dataProvider invalidWindowProvider */
    public function testInvalidCandidateWindowDoesNotQueryTheNode(mixed $rows): void
    {
        $chain = $this->createMock(ChainSnapshotManager::class);
        $chain->expects($this->never())->method('verifyChain');
        $chain->expects($this->never())->method('get');
        $player = $this->player();
        (new RetainedFundsManager($chain))->apply($player, $this->meta(), $rows);
        $this->assertNull($player['retained_alpha_p']);
        $this->assertSame('2000000', $player['available_alpha_p']);
    }

    public static function invalidWindowProvider(): array
    {
        return [
            'malformed' => ['not-json'],
            'invalid address' => [[['address' => 'wrong']]],
            'vault' => [[['address' => self::VAULT]]],
            'duplicate' => [[['address' => self::SOURCE], ['address' => self::SOURCE]]],
            'too many' => [array_fill(0, 17, ['address' => self::SOURCE])],
        ];
    }

    private function player(): array
    {
        return ['id' => '1-1', 'vault_address' => self::VAULT, 'spendable_alpha_p' => '2000000', 'alpha' => '2',
            'funds_meta' => ['ready' => true, 'height' => '3353010']];
    }

    private function meta(): array
    {
        return ['chain_id' => 'structstestnet-111', 'protocol' => 'v0.22.0'];
    }
}
