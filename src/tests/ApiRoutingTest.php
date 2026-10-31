<?php

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Routing\Exception\MethodNotAllowedException;

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
            ['/api/ledger/player/1-101/transfer-source', 'api_transfer_source'],
            ['/api/struct/5-101/generator', 'api_get_generator_snapshot'],
            ['/api/ledger/123', 'api_get_transaction'],
            ['/api/struct/count', 'api_count_structs'],
            ['/api/planet/count', 'api_count_planets'],
            ['/api/stat/load/aggregate/range', 'api_stat_aggregate_range'],
            ['/api/player/power/at-risk', 'api_player_power_at_risk'],
            ['/api/player/1-101/power', 'api_get_player_power'],
            ['/api/planet-activity/player/1-61/page/1', 'api_planet_activity_by_player'],
            ['/api/planet-activity/player/1-61/stats', 'api_planet_activity_player_stats'],
            ['/api/planet-activity/planet/2-1/page/1', 'api_planet_activity_by_planet'],
            ['/api/player/1-101/mini-game/arcade', 'api_get_player_mini_game_progress'],
            ['/api/onboarding/catalog/tutorial-4', 'api_onboarding_catalog'],
            ['/api/onboarding/funnel/tutorial-4/signup', 'api_onboarding_funnel'],
            ['/api/onboarding/tutorial/outcome/tutorial-4', 'api_onboarding_tutorial_outcome'],
            ['/api/onboarding/player/1-101', 'api_onboarding_player'],
        ];
    }

    /** The PUT literal must resolve, and a GET on it must not fall through to a player read. */
    public function testMiniGameProgressPutRoute(): void
    {
        $router = $this->router();
        $router->getContext()->setMethod('PUT');

        $this->assertSame(
            'api_set_player_mini_game_progress',
            $router->match('/api/player/mini-game/progress')['_route']
        );

        $router->getContext()->setMethod('GET');
        $this->expectException(MethodNotAllowedException::class);
        $router->match('/api/player/mini-game/progress');
    }

    /** Onboarding telemetry is POST only, under the unauthenticated /api/onboarding/ firewall. */
    public function testOnboardingEventsPostRoute(): void
    {
        $router = $this->router();
        $router->getContext()->setMethod('POST');

        $this->assertSame('api_onboarding_events', $router->match('/api/onboarding/events')['_route']);

        $router->getContext()->setMethod('GET');
        $this->expectException(MethodNotAllowedException::class);
        $router->match('/api/onboarding/events');
    }

    /** A cross-site image or link must not be able to end a session. */
    public function testLogoutIsPostOnly(): void
    {
        $router = $this->router();
        $router->getContext()->setMethod('POST');

        $this->assertSame('api_logout', $router->match('/api/auth/logout')['_route']);

        $router->getContext()->setMethod('GET');
        $this->expectException(MethodNotAllowedException::class);
        $router->match('/api/auth/logout');
    }
}
