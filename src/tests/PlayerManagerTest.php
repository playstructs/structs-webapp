<?php

use App\Tests\ApiManagerTestCase;
use App\Manager\PlayerManager;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;

class PlayerManagerTest extends ApiManagerTestCase
{
    /**
     * Raids launched are attacker-initiated raid_status rows, not fleets leaving
     * planets the player currently owns. fleet_depart + planet.owner counted
     * enemy departures after a raid on you and missed launches from enemy worlds.
     */
    public function testRaidsLaunchedCountsInitiatedRaidStatusByFleetOwner(): void
    {
        $captured = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAssociative')
            ->willReturnCallback(function (string $sql) use (&$captured) {
                $captured = $sql;

                return ['count' => 3];
            });

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->getPlayerRaidsLaunched('1-101');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString("pa.category = 'raid_status'", $captured);
        $this->assertStringContainsString("pa.detail->>'status' = 'initiated'", $captured);
        $this->assertStringContainsString('INNER JOIN fleet f', $captured);
        $this->assertStringContainsString("f.id = pa.detail->>'fleet_id'", $captured);
        $this->assertStringContainsString('f.owner = :player_id', $captured);
        $this->assertStringNotContainsString('fleet_depart', $captured);
        $this->assertStringNotContainsString('p.owner', $captured);
    }

    /**
     * Raids won count successful raids by the player's fleet and defences of the
     * player's planet, with no condition on seized ore: beating a rival with an
     * empty larder is still a win.
     */
    public function testRaidsWonCountsSuccessfulRaidsAndDefences(): void
    {
        $captured = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAssociative')
            ->willReturnCallback(function (string $sql) use (&$captured) {
                $captured = $sql;

                return ['count' => 2];
            });

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->getPlayerRaidsWon('1-101');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString("pa.category = 'raid_status'", $captured);
        $this->assertStringContainsString("pa.detail->>'status' = 'raidSuccessful' AND f.owner = :player_id", $captured);
        $this->assertStringContainsString("pa.detail->>'status' = 'attackerDefeated' AND p.owner = :player_id", $captured);
        $this->assertStringContainsString("f.id = pa.detail->>'fleet_id'", $captured);
        $this->assertStringContainsString('p.id = pa.planet_id', $captured);
        $this->assertStringNotContainsString('seized', $captured);
    }
}
