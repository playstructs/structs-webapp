<?php

use App\Dto\ApiResponseContentDto;
use App\Util\ConsistentRead;
use App\Util\ResponseMetaUtil;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class ConsistentReadTest extends TestCase
{
    public function testMissingRequiredModelDoesNotBorrowCursorHeight(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())->method('fetchAssociative')->willReturn(false);
        $em = $this->createStub(EntityManagerInterface::class);
        $em->method('getConnection')->willReturn($db);
        $response = new ApiResponseContentDto();

        ResponseMetaUtil::stampHeight($response, $em, 'inventory');

        $this->assertSame(['height' => null, 'data_ready' => false], $response->meta);
    }

    public function testReadCommittedAmbientTransactionIsRefused(): void
    {
        $db = $this->createMock(Connection::class);
        $db->method('isTransactionActive')->willReturn(true);
        $db->expects($this->once())->method('fetchOne')->with('SHOW transaction_isolation')->willReturn('read committed');
        $db->expects($this->never())->method('commit');
        $db->expects($this->never())->method('rollBack');
        $this->expectException(LogicException::class);
        ConsistentRead::run($db, fn () => $this->fail('Weak snapshot was accepted'));
    }

    public function testFailureRollsBackOwnedTransaction(): void
    {
        $db = $this->createMock(Connection::class);
        $db->method('isTransactionActive')->willReturn(false);
        $db->expects($this->once())->method('beginTransaction');
        $db->expects($this->once())->method('executeStatement')->with('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
        $db->expects($this->never())->method('commit');
        $db->expects($this->once())->method('rollBack');
        $this->expectException(RuntimeException::class);
        ConsistentRead::run($db, function () { throw new RuntimeException('fixture'); });
    }

    /** Actual commits on two connections: an old value cannot acquire H's stamp. */
    public function testCommittedBlockBetweenDataAndMetadataUsesOneSnapshot(): void
    {
        $url = getenv('INTEGRATION_DATABASE_URL');
        if (!$url) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $writer = DriverManager::getConnection(['url' => $url]);
        $reader = DriverManager::getConnection(['url' => $url]);
        $tables = ['structs.current_block', 'sync_state.sync_cursor', 'structs.api_refresh_state', 'sync_state.economy_contract'];
        $saved = [];
        $address = 'api-consistent-read-fixture';
        try {
            $writer->beginTransaction();
            $writer->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
            foreach ($tables as $table) {
                $saved[$table] = $writer->fetchAllAssociative('SELECT * FROM ' . $table);
                $writer->executeStatement('DELETE FROM ' . $table);
            }
            $writer->executeStatement("INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
                VALUES('structstestnet-111',3352999,'2026-10-29T12:00:00Z',3352999,'current')");
            $writer->executeStatement("INSERT INTO structs.current_block(chain,height,tip_height,status)
                VALUES('structstestnet-111',3352999,3352999,'current')");
            $writer->executeStatement("INSERT INTO structs.api_refresh_state(model,source_height,source_time,inventory_authority)
                VALUES('inventory',3352999,'2026-10-29T12:00:00Z','current-claims-v1')");
            $writer->executeStatement("INSERT INTO structs.api_inventory(owner_type,owner_id,denom,balance)
                VALUES('address',:address,'ualpha',18446744073709551616)", ['address' => $address]);
            $writer->commit();
            $reader->executeStatement('SET ROLE structs_webapp');
            $query = "SELECT balance::text FROM structs.api_inventory WHERE owner_type='address' AND owner_id=:address AND denom='ualpha'";

            $old = ConsistentRead::run($reader, function () use ($reader, $writer, $query, $address) {
                $data = $reader->fetchOne($query, ['address' => $address]);
                $writer->beginTransaction();
                $writer->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
                $writer->executeStatement("UPDATE structs.api_inventory SET balance=18446744073709551617 WHERE owner_type='address' AND owner_id=:address", ['address' => $address]);
                $writer->executeStatement("UPDATE sync_state.sync_cursor SET last_height=3353000,last_block_time='2026-10-29T12:00:05Z',tip_height=3353000");
                $writer->executeStatement('UPDATE structs.current_block SET height=3353000,tip_height=3353000');
                $writer->executeStatement("UPDATE structs.api_refresh_state SET source_height=3353000,source_time='2026-10-29T12:00:05Z'");
                \App\Tests\ReadinessFixture::economyCoverage($writer);
                $writer->commit();

                return [$data, ResponseMetaUtil::snapshotMeta($reader, 'inventory')];
            });
            $this->assertSame('18446744073709551616', $old[0]);
            $this->assertSame('3352999', $old[1]['height']);
            $this->assertSame('v0.21.0', $old[1]['protocol']);
            $this->assertTrue($old[1]['data_ready']);
            $new = ConsistentRead::run($reader, fn () => [
                $reader->fetchOne($query, ['address' => $address]),
                ResponseMetaUtil::snapshotMeta($reader, 'inventory'),
            ]);
            $this->assertSame('18446744073709551617', $new[0]);
            $this->assertSame('3353000', $new[1]['height']);
            $this->assertSame('v0.22.0', $new[1]['protocol']);
            $this->assertTrue($new[1]['transaction_ready']);

            // Same data can remain present while its completeness marker is absent.
            $writer->executeStatement("DELETE FROM structs.api_refresh_state WHERE model='inventory'");
            $missing = ConsistentRead::run($reader, fn () => ResponseMetaUtil::snapshotMeta($reader, 'inventory'));
            $this->assertNull($missing['height']);
            $this->assertFalse($missing['data_ready']);
            $this->assertFalse($missing['transaction_ready']);
        } finally {
            if ($reader->isTransactionActive()) { $reader->rollBack(); }
            if ($writer->isTransactionActive()) { $writer->rollBack(); }
            if ($saved !== []) {
                $writer->beginTransaction();
                $writer->executeStatement("SELECT pg_advisory_xact_lock(hashtext('structs.api_work_refresh'))");
                foreach ($saved as $table => $rows) {
                    $writer->executeStatement('DELETE FROM ' . $table);
                    foreach ($rows as $row) { $writer->insert($table, $row); }
                }
                $writer->executeStatement("DELETE FROM structs.api_inventory WHERE owner_type='address' AND owner_id=:address", ['address' => $address]);
                $writer->commit();
            }
            $reader->close();
            $writer->close();
        }
    }
}
