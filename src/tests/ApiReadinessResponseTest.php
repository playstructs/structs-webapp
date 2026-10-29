<?php

use App\Controller\TimestampController;
use App\Manager\WorkManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;

class ApiReadinessResponseTest extends ApiManagerTestCase
{
    public function testMissingWorkWatermarkSurvivesTheResponseEnvelope(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->once())->method('beginTransaction');
        $db->expects($this->once())->method('executeStatement')->with('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
        $db->expects($this->once())->method('commit');
        $db->expects($this->once())->method('fetchAllAssociative')->willReturn([]);
        $meta = ['height' => null, 'indexed_height' => '3353000', 'data_ready' => false, 'transaction_ready' => false];
        $db->expects($this->once())->method('fetchAssociative')
            ->with($this->stringContains('structs.api_readiness(ARRAY[:model0]::text[])'), ['model0' => 'work'])
            ->willReturn(['meta' => json_encode($meta)]);

        $response = (new WorkManager($this->entityManager($db), $this->validator()))->getAllWorkByPlayerId('1-1');
        $payload = json_decode($response->getContent(), true);

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertSame([], $payload['data']);
        $this->assertSame($meta, $payload['meta']);
    }

    public function testInvalidRequestDoesNotStartDatabaseWork(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->never())->method('beginTransaction');
        $db->expects($this->never())->method('fetchAllAssociative');
        $response = (new WorkManager($this->entityManager($db), $this->validator()))->getAllWorkByPlayerId('!1-13');
        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testBlockKeepsLegacyFieldsAndAddsIndexedProtocolMetadata(): void
    {
        $db = $this->createMock(Connection::class);
        $row = ['chain_id' => 'structstestnet-111', 'height' => 3352999, 'tip_height' => 3353000,
            'lag_blocks' => 1, 'status' => 'current', 'updated_at' => '2026-10-29 12:00:00+00'];
        $meta = ['height' => '3352999', 'protocol' => 'v0.21.0', 'observed_protocol' => 'v0.22.0',
            'data_ready' => true, 'transaction_ready' => false];
        $db->expects($this->once())->method('beginTransaction');
        $db->expects($this->once())->method('commit');
        $db->expects($this->exactly(2))->method('fetchAssociative')->willReturnOnConsecutiveCalls($row, ['meta' => json_encode($meta)]);

        $response = (new TimestampController())->getCurrentBlock($this->entityManager($db));
        $payload = json_decode($response->getContent(), true);
        $this->assertSame($row, $payload['data']);
        $this->assertSame($meta, $payload['meta']);
    }
}
