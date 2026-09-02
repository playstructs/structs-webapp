<?php

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ApiRoutingTest extends KernelTestCase
{
    private function router()
    {
        self::bootKernel(['environment' => 'test']);
        $router = static::getContainer()->get('router');
        $router->getContext()->setMethod('GET');

        return $router;
    }

    /** /api/ledger/stats must win over /api/ledger/transaction/{tx_id}-style patterns. */
    public function testLedgerStatsRouteIsNotCapturedAsTxId(): void
    {
        $match = $this->router()->match('/api/ledger/stats');

        $this->assertSame('api_ledger_stats', $match['_route']);
        $this->assertArrayNotHasKey('tx_id', $match);
    }

    /**
     * Literal segments declared alongside {id} patterns only win because they are
     * declared first, so this pins the resolution rather than the declaration order.
     *
     * @dataProvider literalRouteProvider
     */
    public function testLiteralRoutesResolve(string $path, string $expected): void
    {
        $this->assertSame($expected, $this->router()->match($path)['_route']);
    }

    public static function literalRouteProvider(): array
    {
        return [
            ['/api/leaderboard/player', 'api_leaderboard'],
            ['/api/player/count', 'api_count_players'],
            ['/api/player/1-101', 'api_get_player'],
            ['/api/struct/count', 'api_count_structs'],
            ['/api/planet/count', 'api_count_planets'],
            ['/api/stat/load/aggregate/range', 'api_stat_aggregate_range'],
            ['/api/player/power/at-risk', 'api_player_power_at_risk'],
            ['/api/player/1-101/power', 'api_get_player_power'],
        ];
    }
}
