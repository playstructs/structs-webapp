<?php

use App\Tests\ApiManagerTestCase;
use App\Manager\GuildManager;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;

class GuildManagerTest extends ApiManagerTestCase
{
    /**
     * `alpha` keeps legacy display units so the roster screen renders unchanged;
     * `alpha_p` carries the same holdings in ualpha. Reading the display figure
     * from api_inventory instead would inflate it by 1e6, since that table only
     * ever carries base denominations.
     */
    public function testRosterReturnsDisplayAndPrecisionAlpha(): void
    {
        $sql = $this->captureRosterSql();

        $this->assertStringContainsString('view.player_inventory', $sql);
        $this->assertStringContainsString('as alpha,', $sql);
        $this->assertStringContainsString('structs.api_inventory', $sql);
        $this->assertStringContainsString('as alpha_p', $sql);
    }

    /**
     * Roster alpha is a display figure, not spendable liquidity, so infused and
     * defusing holdings count toward it on both scales.
     */
    public function testRosterCombinesAlphaStates(): void
    {
        $sql = $this->captureRosterSql();

        $this->assertStringContainsString("denom IN ('alpha', 'alpha.infused', 'alpha.defusing')", $sql);
        $this->assertStringContainsString("denom IN ('ualpha', 'ualpha.infused', 'ualpha.defusing')", $sql);
    }

    /**
     * view.player owns the milliwatt-to-watt arithmetic. Re-deriving it here from
     * grid once produced numbers that diverged from every other consumer, so the
     * scaling must stay in the view rather than being reimplemented in a Manager.
     */
    public function testGuildPowerStatsSourcesFromViewPlayer(): void
    {
        $captured = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAssociative')
            ->willReturnCallback(function (string $sql) use (&$captured) {
                $captured = $sql;

                return ['guild_id' => '0-1', 'total_load' => 1, 'total_capacity' => 1, 'avg_connection_capacity' => 1, 'total_fuel' => 0];
            });

        $manager = new GuildManager($this->entityManager($connection), $this->validator());
        $response = $manager->getGuildPowerStats('0-1');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString('view.player', $captured);
        $this->assertStringNotContainsString('attribute_type', $captured);
        $this->assertStringNotContainsString('/ 1000', $captured);
    }

    /** Display and precision columns are served side by side. */
    public function testGuildPowerStatsExposesBothScales(): void
    {
        $captured = null;
        $connection = $this->createMock(Connection::class);
        $connection->method('fetchAssociative')
            ->willReturnCallback(function (string $sql) use (&$captured) {
                $captured = $sql;

                return ['guild_id' => '0-1'];
            });

        (new GuildManager($this->entityManager($connection), $this->validator()))
            ->getGuildPowerStats('0-1');

        foreach (['total_load', 'total_capacity', 'total_fuel', 'avg_connection_capacity'] as $field) {
            $this->assertStringContainsString("as {$field},", $captured . ',');
            $this->assertStringContainsString("as {$field}_p", $captured);
        }
    }

    private function captureRosterSql(): string
    {
        $captured = null;
        $manager = new GuildManager(
            $this->entityManager($this->capturingConnection($captured)),
            $this->validator()
        );
        $manager->getGuildRoster('0-1');

        $this->assertNotNull($captured);

        return $captured;
    }
}
