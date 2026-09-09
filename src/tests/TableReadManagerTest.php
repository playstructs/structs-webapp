<?php

use App\Tests\ApiManagerTestCase;
use App\Manager\TableReadManager;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class TableReadManagerTest extends ApiManagerTestCase
{
    public function testGridRejectsUnknownOrder(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $response = $this->manager($connection, ['order' => 'injected.desc'])
            ->gridByAttributeType('load', 1);

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('order_invalid', $content['errors']);
    }

    /** A cursor and an offset together would skip rows, so the cursor replaces it. */
    public function testAfterIdDropsOffset(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['after_id' => '1-1'])->playerListAll(2);

        $this->assertStringContainsString(':after_id', $captured);
        $this->assertDoesNotMatchRegularExpression('/OFFSET\s+\d+/i', $captured);
    }

    /**
     * Pages run updated_at DESC, id ASC, so the tie-breaker has to move forward
     * through ids. A plain tuple comparison would walk it backwards and re-serve
     * rows that share the cursor's timestamp.
     */
    public function testAfterIdFollowsThePageOrder(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['after_id' => '1-1'])->playerListAll(1);

        $this->assertStringContainsString("COALESCE(updated_at, '-infinity') <", $captured);
        $this->assertStringContainsString('AND id > :after_id', $captured);
    }

    /** grid.object_type is varchar, so casting the filter to the enum would not compare. */
    public function testGridObjectTypeFilterDoesNotCastToEnum(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, [])->gridByAttributeTypeAndObjectType('load', 'player', 1);

        $this->assertStringContainsString('object_type = :object_type', $captured);
        $this->assertStringNotContainsString('structs.object_type', $captured);
    }

    public function testIncludeMetaStampsHeight(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())->method('fetchAllAssociative')->willReturn([]);
        $connection->expects($this->once())->method('fetchAssociative')->willReturn(['height' => 42]);

        $response = $this->manager($connection, ['include_meta' => '1'])->playerListAll(1);
        $content = json_decode($response->getContent(), true);

        $this->assertSame(42, $content['meta']['height']);
    }

    /** The total counts the filtered relation directly, not a wrapped page query. */
    public function testIncludeTotalCountsWithoutTheOrderedPage(): void
    {
        $captured = null;
        $connection = $this->createMock(Connection::class);
        $connection->method('fetchAllAssociative')->willReturn([]);
        $connection->expects($this->once())
            ->method('fetchOne')
            ->willReturnCallback(function (string $sql) use (&$captured) {
                $captured = $sql;

                return 7;
            });

        $response = $this->manager($connection, ['include_total' => '1'])->playerListAll(1);

        $this->assertSame(7, json_decode($response->getContent(), true)['total']);
        $this->assertStringContainsString('SELECT count(*) FROM structs.player', $captured);
        $this->assertStringNotContainsString('ORDER BY', $captured);
        $this->assertStringNotContainsString('LIMIT', $captured);
    }

    /**
     * Cursor support is declared per endpoint. A consumer paging a feed needs to be
     * told its cursor was ignored, not handed a silently offset-paged result.
     *
     * @dataProvider unsupportedParamProvider
     */
    public function testUnsupportedListParamsAreRejected(string $param, string $value, string $method): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $response = $this->manager($connection, [$param => $value])->{$method}(1);

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey("{$param}_unsupported", $content['errors']);
    }

    public static function unsupportedParamProvider(): array
    {
        return [
            // ledger is ordered by (time, id) so neither cursor nor updated_since apply
            'after_id on ledger' => ['after_id', '5-1', 'ledgerListAll'],
            'updated_since on ledger' => ['updated_since', '1', 'ledgerListAll'],
            // struct has no seq column
            'since_seq on struct' => ['since_seq', '1', 'structListAll'],
            // seq counts per planet, so it is only a cursor once filtered to one planet
            'since_seq on planet_activity all' => ['since_seq', '1', 'planetActivityAll'],
            'after_id on planet_activity all' => ['after_id', '5-1', 'planetActivityAll'],
            // order and is_destroyed are only understood by grid and struct reads
            'order on player' => ['order', 'id.asc', 'playerListAll'],
            'is_destroyed on player' => ['is_destroyed', '1', 'playerListAll'],
            'since_height on planet_activity all' => ['since_height', '1', 'planetActivityAll'],
            'since_height on player list' => ['since_height', '1', 'playerListAll'],
        ];
    }

    /** A single planet's activity pages on its seq counter rather than the (updated_at, id) tuple. */
    public function testPlanetActivityByPlanetUsesSeqCursor(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['since_seq' => '500'])->planetActivityByPlanet('2-1', 1);

        $this->assertStringContainsString('seq > :since_seq', $captured);
        $this->assertDoesNotMatchRegularExpression('/OFFSET\s+\d+/i', $captured);
    }

    /**
     * seq is per-planet, so a player feed spanning planets cannot use it as a
     * high-water mark. since_height (block_height) is the global cursor.
     */
    public function testPlanetActivityByPlayerRejectsSinceSeq(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $response = $this->manager($connection, ['since_seq' => '1'])
            ->planetActivityByPlayer('1-61', 1, null);

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('since_seq_unsupported', $content['errors']);
    }

    /**
     * Attacks name the player in detail; raids and structs name an object we own
     * now. Both halves of struct_attack are required so defensive figures are not
     * silently zero.
     */
    public function testPlanetActivityByPlayerAttributesAttacksRaidsAndOwnedObjects(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, [])->planetActivityByPlayer('1-61', 1, null);

        $this->assertStringContainsString('block_height', $captured);
        $this->assertStringContainsString("jsonb_build_object('attackerPlayerId', CAST(:player_id AS text))", $captured);
        $this->assertStringContainsString("jsonb_build_object('targetPlayerId', CAST(:player_id AS text))", $captured);
        $this->assertStringContainsString("detail->>'fleet_id'", $captured);
        $this->assertStringContainsString("detail->>'struct_id'", $captured);
        $this->assertStringContainsString("detail->>'defender_struct_id'", $captured);
        $this->assertStringContainsString('FROM structs.fleet WHERE owner = :player_id', $captured);
        $this->assertStringContainsString('FROM structs.planet WHERE owner = :player_id', $captured);
        $this->assertStringContainsString('FROM structs.struct WHERE owner = :player_id', $captured);
        $this->assertStringContainsString('ORDER BY block_height DESC, time DESC, planet_id DESC, seq DESC', $captured);
    }

    public function testPlanetActivityByPlayerRestrictsToOneCategory(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, [])->planetActivityByPlayer('1-61', 1, 'struct_attack');

        $this->assertStringContainsString("category = CAST(:category AS structs.grass_category)", $captured);
        $this->assertStringContainsString("jsonb_build_object('attackerPlayerId', CAST(:player_id AS text))", $captured);
        $this->assertStringContainsString("jsonb_build_object('targetPlayerId', CAST(:player_id AS text))", $captured);
        $this->assertStringNotContainsString("detail->>'struct_id'", $captured);
        $this->assertStringNotContainsString("detail->>'fleet_id'", $captured);
    }

    public function testPlanetActivityByPlayerDefenseCategoryUsesDefenderStructId(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, [])->planetActivityByPlayer('1-61', 1, 'struct_defense_add');

        $this->assertStringContainsString("detail->>'defender_struct_id'", $captured);
        $this->assertStringNotContainsString("detail->>'struct_id'", $captured);
        $this->assertStringNotContainsString("jsonb_build_object('attackerPlayerId'", $captured);
    }

    public function testPlanetActivityByPlayerFiltersSinceHeightWithoutDroppingOffset(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['since_height' => '2530000'])->planetActivityByPlayer('1-61', 2, null);

        $this->assertStringContainsString('block_height > :since_height', $captured);
        $this->assertMatchesRegularExpression('/OFFSET\s+\d+/i', $captured);
    }

    public function testPlanetActivityByPlayerHonoursAscOrder(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['order' => 'asc'])->planetActivityByPlayer('1-61', 1, null);

        $this->assertStringContainsString('ORDER BY block_height ASC, time ASC, planet_id ASC, seq ASC', $captured);
    }

    public function testPlanetActivityByPlayerRejectsUnknownOrder(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $response = $this->manager($connection, ['order' => 'time.desc'])
            ->planetActivityByPlayer('1-61', 1, null);

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('order_invalid', $content['errors']);
    }

    public function testPlanetActivityByPlayerRejectsUnknownCategory(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->never())->method('fetchAllAssociative');

        $response = $this->manager($connection, [])->planetActivityByPlayer('1-61', 1, 'block');

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $content = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('category_invalid', $content['errors']);
    }

    public function testPlanetActivityByPlayerDecodesDetailJson(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->method('fetchAllAssociative')->willReturn([
            [
                'time' => '2026-09-08 19:19:58.364481+00',
                'seq' => 52,
                'planet_id' => '2-29315',
                'block_height' => 2531884,
                'category' => 'raid_status',
                'detail' => '{"planet_id":"2-29315","fleet_id":"9-1","status":"initiated"}',
            ],
        ]);

        $response = $this->manager($connection, [])->planetActivityByPlayer('1-61', 1, null);
        $row = json_decode($response->getContent(), true)['data'][0];

        $this->assertSame(2531884, $row['block_height']);
        $this->assertSame('initiated', $row['detail_json']['status']);
    }

    public function testGridHonoursAllowlistedOrder(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['order' => 'val.desc'])->gridByAttributeType('load', 1);

        $this->assertStringContainsString('ORDER BY val DESC, id', $captured);
    }

    public function testStructListHonoursIsDestroyed(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['is_destroyed' => '0'])->structListAll(1);

        $this->assertStringContainsString("is_destroyed = (:is_destroyed = '1')", $captured);
    }

    public function testUpdatedSinceFiltersSupportedEndpoint(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        $this->manager($connection, ['updated_since' => '1700000000'])->structListAll(1);

        $this->assertStringContainsString('updated_at > to_timestamp(:updated_since)', $captured);
    }

    private function manager(Connection $connection, array $query): TableReadManager
    {
        return (new TableReadManager($this->entityManager($connection), $this->validator()))
            ->applyListQuery(Request::create('/api/test', 'GET', $query));
    }
}
