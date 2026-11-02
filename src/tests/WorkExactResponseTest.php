<?php

use App\Manager\WorkManager;
use App\Manager\StructManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\DriverManager;

class WorkExactResponseTest extends ApiManagerTestCase
{
    public static function workValues(): array
    {
        return [['3352999', '2147483647'], ['2147483648', '9007199254740993'],
            ['9223372036854775808', '18446744073709551615']];
    }

    /** @dataProvider workValues */
    public function testAllWorkListsReturnExactDecimalStringsUnderRestrictedRole(string $start, string $difficulty): void
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
                ('5-990970','1-990970','5-990970','BUILD',:start,:difficulty,'planet','2-990970','2-990970')",
                ['start' => $start, 'difficulty' => $difficulty]);
            $db->executeStatement('INSERT INTO structs.struct_type(id,build_difficulty,ore_mining_difficulty,ore_refining_difficulty)
                VALUES (990970,:difficulty,:difficulty,:difficulty)', ['difficulty' => $difficulty]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            // SET ROLE does not apply the login role's configured search_path.
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $manager = new WorkManager($this->entityManager($db), $this->validator());
            foreach ([$manager->getAllWorkByPlayerId('1-990970'), $manager->getWorkByGuildId('0-990970', 1),
                $manager->getAllWorkPaged(1)] as $response) {
                $payload = json_decode($response->getContent(), true);
                $this->assertSame(200, $response->getStatusCode());
                $this->assertSame($start, $payload['data'][0]['block_start']);
                $this->assertSame($difficulty, $payload['data'][0]['difficulty_target']);
                $this->assertArrayHasKey('meta', $payload);
            }
            $catalog = new StructManager($this->entityManager($db), $this->validator());
            $catalogPayload = json_decode($catalog->getAllStructTypes()->getContent(), true);
            $this->assertArrayHasKey('meta', $catalogPayload);
            $this->assertSame('structs-api-v022-1', $catalogPayload['meta']['api_contract']);
            $this->assertSame([], $catalogPayload['meta']['required_models']);
            $type = array_values(array_filter($catalogPayload['data'], static fn (array $row): bool => (int) $row['id'] === 990970))[0];
            foreach (['build_difficulty', 'ore_mining_difficulty', 'ore_refining_difficulty'] as $field) {
                $this->assertSame($difficulty, $type[$field]);
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
