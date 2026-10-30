<?php

use App\Constant\RegexPattern;
use App\Manager\InventoryManager;
use App\Manager\GuildManager;
use App\Manager\TableReadManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpFoundation\Request;

class CatalogEconomyTest extends ApiManagerTestCase
{
    public static function denominations(): array
    {
        return array_map(static fn (string $denom): array => [$denom], [
            'ualpha', 'uguild.0-1', 'ibc/' . str_repeat('A', 64),
            'factory/structs1issuer/token:series.1', 'abc/page/2', 'a' . str_repeat('_', 127),
        ]);
    }

    /** @dataProvider denominations */
    public function testFullDenominationRoutesAndBoundFilters(string $denom): void
    {
        self::bootKernel(['environment' => 'test']);
        $router = static::getContainer()->get('router');
        $router->getContext()->setMethod('GET');
        foreach (['inventory', 'provider'] as $resource) {
            $match = $router->match('/api/' . $resource . '/denom/' . rawurlencode($denom) . '/page/2');
            $this->assertSame('api_' . $resource . '_by_denom', $match['_route']);
            $this->assertSame($denom, $match['denom']);
            $this->assertSame('2', $match['page']);
            $db = $this->createMock(Connection::class);
            $db->expects($this->once())->method('fetchAllAssociative')->willReturnCallback(
                function (string $sql, array $params) use ($denom): array {
                    $this->assertStringContainsString('= :denom', $sql);
                    $this->assertStringNotContainsString($denom, $sql);
                    $this->assertSame($denom, $params['denom']);
                    return [];
                }
            );
            $db->method('fetchAssociative')->willReturn(['meta' => '{}']);
            $response = $resource === 'inventory'
                ? (new InventoryManager($this->entityManager($db), $this->validator()))->inventoryByDenom($denom, 2, null)
                : (new TableReadManager($this->entityManager($db), $this->validator()))->providerByDenom($denom, 2);
            $this->assertSame(200, $response->getStatusCode());
        }
        $this->assertSame(0, preg_match(RegexPattern::SLUG, 'factory/issuer/token'), 'Unrelated slugs stay restricted');
    }

    public function testInvalidDenominationsDoNotReachSql(): void
    {
        foreach (['', 'aa', '1alpha', 'a' . str_repeat('_', 128), 'éalpha', 'abc%2Fdef', "ualpha\n", "abc';--", 'abc def'] as $denom) {
            $db = $this->createMock(Connection::class);
            $db->expects($this->never())->method('beginTransaction');
            $db->expects($this->never())->method('fetchAllAssociative');
            $inventory = new InventoryManager($this->entityManager($db), $this->validator());
            $catalog = (new TableReadManager($this->entityManager($db), $this->validator()))
                ->applyListQuery(new Request(['include_meta' => '1', 'include_total' => '1']));
            $this->assertSame(400, $inventory->inventoryByDenom($denom, 1, null)->getStatusCode(), $denom);
            $this->assertSame(400, $catalog->providerByDenom($denom, 1)->getStatusCode(), $denom);
        }
    }

    public function testCatalogPageCountAndHeightShareOneSnapshot(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())->method('beginTransaction');
        $db->expects($this->once())->method('executeStatement')->with('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
        $db->expects($this->once())->method('commit');
        $db->expects($this->once())->method('fetchAllAssociative')->willReturn([['id' => '9-1']]);
        $db->expects($this->once())->method('fetchOne')->willReturn(1);
        $db->expects($this->once())->method('fetchAssociative')->willReturn(['height' => 3353000]);
        $manager = (new TableReadManager($this->entityManager($db), $this->validator()))
            ->applyListQuery(new Request(['include_meta' => '1', 'include_total' => '1']));
        $body = json_decode($manager->providerByDenom('ualpha', 1)->getContent(), true);
        $this->assertSame(1, $body['total']);
        $this->assertSame(3353000, $body['meta']['height']);
        $this->assertSame([['id' => '9-1']], $body['data']);
    }

    public function testIssuerValuationAndGuildCatalogUnderRestrictedRole(): void
    {
        $url = getenv('INTEGRATION_DATABASE_URL');
        if (!$url) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
            $db->executeStatement("INSERT INTO structs.guild(id,rank_purchase_base_price,rank_purchase_step_increase,
                rank_purchase_minimum_rank,join_by_rank_purchase_enabled,bank_convert_in_fee,bank_convert_out_fee,charter_solver_id)
                VALUES ('0-990980',9007199254740993,123,4,true,0.125,0.025,'1-990980'),('0-990979',0,0,0,false,NULL,NULL,NULL)");
            $db->executeStatement("INSERT INTO structs.player(id,guild_id,primary_address) VALUES('1-990980','0-990980','catalogprimary')");
            $db->executeStatement("INSERT INTO structs.reactor(id,validator) VALUES('3-990980','catalogvalidator')");
            $db->executeStatement("UPDATE structs.guild SET primary_reactor_id='3-990980' WHERE id='0-990980'");
            $db->executeStatement("INSERT INTO structs.api_guild_bank(guild_id,denom,collateral,supply) VALUES
                ('0-990980','uguild.0-990980',9,3),('0-990979','uguild.0-990979',1,3)");
            $db->executeStatement("INSERT INTO structs.provider(id,owner,rate_amount,rate_denom) VALUES
                ('9-990980','0-990980',3,'uguild.0-990979'),
                ('9-990979','1-990980',2,'uguild.0-990980'),
                ('9-990978','0-990980',9007199254740993,'ualpha'),
                ('9-990977','0-990980',3,'factory/issuer/token:one'),
                ('9-990976','0-990980',3,'alpha')");
            $db->executeStatement("INSERT INTO structs.substation(id,owner,deletion_pending,deletion_migration_substation_id)
                VALUES('4-990980','0-990980',true,'4-990979')");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new TableReadManager($this->entityManager($db), $this->validator());
            $payload = json_decode($manager->providerMarket()->getContent(), true);
            $rows = array_column($payload['data'], null, 'id');
            $this->assertSame('0-990980', $rows['9-990980']['owner']);
            $this->assertSame('0-990980', $rows['9-990980']['guild_id'], 'No guild_meta row is required');
            $this->assertSame('1', $rows['9-990980']['alpha_equivalent_rate_p'], 'Use issuer collateral/supply, with exact integer division');
            $this->assertSame('0-990980', $rows['9-990979']['guild_id']);
            $this->assertSame('6', $rows['9-990979']['alpha_equivalent_rate_p']);
            $this->assertSame('9007199254740993', $rows['9-990978']['alpha_equivalent_rate_p']);
            $this->assertNull($rows['9-990977']['alpha_equivalent_rate_p']);
            $this->assertNull($rows['9-990976']['alpha_equivalent_rate_p'], 'Only ualpha is the native bank denomination');
            $this->assertSame('factory/issuer/token:one', $rows['9-990977']['rate_denom']);
            $filtered = json_decode($manager->providerByDenom('factory/issuer/token:one', 1)->getContent(), true)['data'];
            $this->assertSame(['9-990977'], array_column($filtered, 'id'));
            $owned = json_decode($manager->providerByOwner('0-990980', 1)->getContent(), true)['data'];
            $this->assertCount(4, $owned);
            $guilds = array_column(json_decode($manager->guildAll(1)->getContent(), true)['data'], null, 'id');
            $this->assertSame('9007199254740993', $guilds['0-990980']['rank_purchase_base_price']);
            $this->assertSame('123', $guilds['0-990980']['rank_purchase_step_increase']);
            $this->assertSame('4', $guilds['0-990980']['rank_purchase_minimum_rank']);
            $this->assertTrue($guilds['0-990980']['join_by_rank_purchase_enabled']);
            $this->assertSame('0.125', $guilds['0-990980']['bank_convert_in_fee']);
            $this->assertSame('0.025', $guilds['0-990980']['bank_convert_out_fee']);
            $this->assertSame('1-990980', $guilds['0-990980']['charter_solver_id']);
            $guildManager = new GuildManager($this->entityManager($db), $this->validator());
            $guild = json_decode($guildManager->getGuild('0-990980')->getContent(), true)['data'];
            foreach (['rank_purchase_base_price', 'rank_purchase_step_increase', 'rank_purchase_minimum_rank',
                'join_by_rank_purchase_enabled', 'bank_convert_in_fee', 'bank_convert_out_fee', 'charter_solver_id'] as $field) {
                $this->assertSame($guilds['0-990980'][$field], $guild[$field], $field);
            }
            $station = json_decode($manager->substationByOwner('0-990980', 1)->getContent(), true)['data'][0];
            $this->assertTrue($station['deletion_pending']);
            $this->assertSame('4-990979', $station['deletion_migration_substation_id']);

            // A known zero price and an unpriceable zero supply have different meanings.
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.api_guild_bank SET collateral=0 WHERE guild_id='0-990979'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $rows = array_column(json_decode($manager->providerMarket()->getContent(), true)['data'], null, 'id');
            $this->assertSame('0', $rows['9-990980']['alpha_equivalent_rate_p']);
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.api_guild_bank SET supply=0 WHERE guild_id='0-990979'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $rows = array_column(json_decode($manager->providerMarket()->getContent(), true)['data'], null, 'id');
            $this->assertNull($rows['9-990980']['alpha_equivalent_rate_p']);
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
