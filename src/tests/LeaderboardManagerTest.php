<?php

use App\Tests\ApiManagerTestCase;
use App\Manager\LeaderboardManager;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;

class LeaderboardManagerTest extends ApiManagerTestCase
{
    public function testRejectsUnknownOrder(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $manager = new LeaderboardManager($this->entityManager($connection), $this->validator());
        $response = $manager->getLeaderboard('player', 'drop_table.desc', '10');

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('order_invalid', $content['errors']);
    }

    /**
     * The api_leaderboard_* tables hold base denominations under bare column names,
     * so the API renames them on the way out rather than shipping an ambiguous
     * `alpha_balance` that is actually ualpha.
     */
    public function testAmountsAreExposedAsPrecisionColumns(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        (new LeaderboardManager($this->entityManager($connection), $this->validator()))
            ->getLeaderboard('player', null, '10');

        $this->assertStringContainsString('AS alpha_balance_p', $captured);
        $this->assertStringContainsString('AS alpha_value_p', $captured);
        $this->assertStringNotContainsString('AS alpha_balance,', $captured);
        $this->assertStringContainsString('::text', $captured);
    }
}
