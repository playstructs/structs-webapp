<?php

use App\Manager\WorkManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\DriverManager;

class WorkExactResponseTest extends ApiManagerTestCase
{
    public function testAllWorkListsReturnExactDecimalStringsUnderRestrictedRole(): void
    {
        $url = getenv('INTEGRATION_DATABASE_URL');
        if (!$url) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            $db->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
            $db->executeStatement("INSERT INTO structs.guild(id) VALUES('0-990970')");
            $db->executeStatement("INSERT INTO structs.player(id,guild_id,primary_address) VALUES('1-990970','0-990970','work-response-fixture')");
            $db->executeStatement('DELETE FROM structs.api_work');
            $db->executeStatement("INSERT INTO structs.api_work(object_id,player_id,target_id,category,block_start,
                difficulty_target,location_type,location_id,planet_id) VALUES
                ('5-990970','1-990970','5-990970','BUILD',3352999,2147483647,'planet','2-990970','2-990970')");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new WorkManager($this->entityManager($db), $this->validator());
            foreach ([$manager->getAllWorkByPlayerId('1-990970'), $manager->getWorkByGuildId('0-990970', 1),
                $manager->getAllWorkPaged(1)] as $response) {
                $payload = json_decode($response->getContent(), true);
                $this->assertSame(200, $response->getStatusCode());
                $this->assertSame('3352999', $payload['data'][0]['block_start']);
                $this->assertSame('2147483647', $payload['data'][0]['difficulty_target']);
                $this->assertArrayHasKey('meta', $payload);
            }
            $empty = json_decode($manager->getAllWorkByPlayerId('1-990969')->getContent(), true);
            $this->assertSame([], $empty['data']);
            $this->assertArrayHasKey('meta', $empty);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
