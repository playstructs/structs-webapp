<?php

use App\Tests\ApiManagerTestCase;
use App\Entity\Player;
use App\Manager\PlayerManager;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
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

    /**
     * Mini game progress is read per player and per interface.
     */
    public function testMiniGameProgressFiltersByPlayerAndInterface(): void
    {
        $captured = null;
        $capturedParams = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturnCallback(function (string $sql, array $params) use (&$captured, &$capturedParams) {
                $captured = $sql;
                $capturedParams = $params;

                return [['game_name' => 'snake', 'score' => 40, 'updated_at' => '2026-10-16 12:00:00+00']];
            });

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->getPlayerMiniGameProgress('1-101', 'arcade');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString('FROM mini_game_progress', $captured);
        $this->assertStringContainsString('player_id = :player_id', $captured);
        $this->assertStringContainsString('interface_name = :interface_name', $captured);
        $this->assertSame(['player_id' => '1-101', 'interface_name' => 'arcade'], $capturedParams);

        $body = json_decode($response->getContent(), true);
        $this->assertTrue($body['success']);
        $this->assertSame('snake', $body['data'][0]['game_name']);
    }

    public function testMiniGameProgressRejectsBadInterfaceName(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->getPlayerMiniGameProgress('1-101', 'bad name!');

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    /**
     * The upsert keeps the best score, only bumps updated_at on improvement, and
     * writes for the session's player even when the body names someone else.
     */
    public function testSetMiniGameProgressUpsertsBestScoreForSessionPlayer(): void
    {
        $captured = null;
        $capturedParams = null;
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAssociative')
            ->willReturnCallback(function (string $sql, array $params) use (&$captured, &$capturedParams) {
                $captured = $sql;
                $capturedParams = $params;

                return [
                    'interface_name' => 'arcade',
                    'game_name' => 'snake',
                    'score' => 120,
                    'created_at' => '2026-10-16 12:00:00+00',
                    'updated_at' => '2026-10-16 12:00:00+00',
                ];
            });

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->setPlayerMiniGameProgress(
            $this->jsonRequest([
                'player_id' => '1-999',
                'interface_name' => 'arcade',
                'game_name' => 'snake',
                'score' => 120,
            ]),
            $this->securityFor('1-101')
        );

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertStringContainsString('INSERT INTO mini_game_progress', $captured);
        $this->assertStringContainsString('ON CONFLICT (player_id, interface_name, game_name) DO UPDATE', $captured);
        $this->assertStringContainsString('GREATEST(mini_game_progress.score, EXCLUDED.score)', $captured);
        $this->assertStringContainsString('WHEN EXCLUDED.score > mini_game_progress.score THEN now()', $captured);
        $this->assertStringContainsString('RETURNING', $captured);
        $this->assertSame('1-101', $capturedParams['player_id']);
        $this->assertSame(120, $capturedParams['score']);
        $this->assertSame('arcade', $capturedParams['interface_name']);
        $this->assertSame('snake', $capturedParams['game_name']);

        $body = json_decode($response->getContent(), true);
        $this->assertTrue($body['success']);
        $this->assertSame(120, $body['data']['score']);
    }

    public function testSetMiniGameProgressAcceptsZeroScore(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())->method('fetchAssociative')->willReturn(['score' => 0]);

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->setPlayerMiniGameProgress(
            $this->jsonRequest(['interface_name' => 'arcade', 'game_name' => 'snake', 'score' => 0]),
            $this->securityFor('1-101')
        );

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
    }

    /**
     * @dataProvider badMiniGameProgressProvider
     */
    public function testSetMiniGameProgressRejectsBadInput(array $body, string $expectedError): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAssociative');

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $response = $manager->setPlayerMiniGameProgress($this->jsonRequest($body), $this->securityFor('1-101'));

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertNull($content['data']);
        $this->assertStringContainsString($expectedError, json_encode($content['errors']));
    }

    public static function badMiniGameProgressProvider(): array
    {
        $ok = ['interface_name' => 'arcade', 'game_name' => 'snake', 'score' => 10];

        return [
            'missing game_name' => [['interface_name' => 'arcade', 'score' => 10], 'game_name_required'],
            'missing score' => [['interface_name' => 'arcade', 'game_name' => 'snake'], 'score_required'],
            'empty interface_name' => [['interface_name' => ''] + $ok, 'interface_name'],
            'negative score' => [['score' => -1] + $ok, 'score'],
            'score too high' => [['score' => 1000001] + $ok, 'score'],
            'float score' => [['score' => 1.5] + $ok, 'score'],
            'string score' => [['score' => '10'] + $ok, 'score'],
            'boolean score' => [['score' => true] + $ok, 'score'],
            'bad characters in game_name' => [['game_name' => 'snake; drop'] + $ok, 'game_name'],
            'bad characters in interface_name' => [['interface_name' => 'arc/ade'] + $ok, 'interface_name'],
            'game_name too long' => [['game_name' => str_repeat('a', 65)] + $ok, 'game_name'],
            'array game_name' => [['game_name' => ['snake']] + $ok, 'game_name'],
        ];
    }

    public function testSetMiniGameProgressRejectsNonJsonBody(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAssociative');

        $manager = new PlayerManager($this->entityManager($connection), $this->validator());
        $request = Request::create('/api/player/mini-game/progress', 'PUT', [], [], [], [], 'not json');
        $response = $manager->setPlayerMiniGameProgress($request, $this->securityFor('1-101'));

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    private function jsonRequest(array $body): Request
    {
        return Request::create('/api/player/mini-game/progress', 'PUT', [], [], [], [], json_encode($body));
    }

    private function securityFor(string $playerId): Security
    {
        $player = $this->createStub(Player::class);
        $player->method('getId')->willReturn($playerId);

        $security = $this->createStub(Security::class);
        $security->method('getUser')->willReturn($player);

        return $security;
    }
}
