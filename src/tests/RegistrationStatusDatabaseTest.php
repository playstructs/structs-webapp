<?php

use App\Manager\AddressRegistrationProofManager;
use App\Manager\PlayerAddressManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DriverManager;

class RegistrationStatusDatabaseTest extends ApiManagerTestCase
{
    private const string ADDRESS = 'structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a';

    public function testInvalidIdentityDoesNotReadSqlOrChain(): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects($this->never())->method('beginTransaction');
        $proof = $this->createMock(AddressRegistrationProofManager::class);
        $proof->expects($this->never())->method('readContext');
        $manager = new PlayerAddressManager($this->entityManager($db), $this->validator());
        $this->assertSame(400, $manager->getRegistrationStatus('1-1!', self::ADDRESS, $proof)->getStatusCode());
        $this->assertSame(400, $manager->getRegistrationStatus('1-1', 'bad-address!', $proof)->getStatusCode());
        $this->assertSame(400, $manager->getRegistrationStatus('1-1', 'invalid', $proof)->getStatusCode());
    }

    public function testNativeAndIndexedIdentitiesKeepTheirSeparateEvidence(): void
    {
        if (!$url = getenv('INTEGRATION_DATABASE_URL')) $this->markTestSkipped('Requires the disposable Sqitch database');
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement("INSERT INTO structs.player_address(address,player_id,guild_id,status)
                VALUES(:address,'1-990965','0-990965','approved')", ['address' => self::ADDRESS]);
            $db->executeStatement('DELETE FROM structs.current_block');
            $db->executeStatement('DELETE FROM sync_state.sync_cursor');
            $db->executeStatement("INSERT INTO sync_state.sync_cursor(chain_id,last_height,last_block_time,tip_height,status)
                VALUES('structstestnet-111',3353011,now(),3353012,'current')");
            $db->executeStatement("INSERT INTO structs.current_block(chain,height,tip_height,status)
                VALUES('structstestnet-111',3353011,3353012,'current')");
            \App\Tests\ReadinessFixture::economyCoverage($db);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $context = ['chain_id' => 'structstestnet-111', 'protocol' => 'v0.22.0', 'source_height' => '3353012',
                'player_id' => '1-990965', 'address' => self::ADDRESS, 'proof_nonce' => '9007199254740994',
                'registered_player_id' => '1-990965', 'timeout_height' => '0'];
            $proof = $this->createStub(AddressRegistrationProofManager::class);
            $proof->method('readContext')->willReturnCallback(fn () => $context);
            $manager = new PlayerAddressManager($this->entityManager($db), $this->validator());
            $response = $manager->getRegistrationStatus('1-990965', self::ADDRESS, $proof);
            $this->assertSame(200, $response->getStatusCode(), $response->getContent());
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
            $body = json_decode($response->getContent(), true);
            $this->assertTrue($body['meta']['transaction_ready']);
            $this->assertSame('3353011', $body['meta']['height']);
            $this->assertSame($context, $body['data']['chain']);
            $this->assertSame(['address' => self::ADDRESS, 'player_id' => '1-990965', 'guild_id' => '0-990965', 'status' => 'approved'], $body['data']['indexed']);

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("INSERT INTO structs.permission(id,object_id,object_type,object_index,player_id,val)
                VALUES('device-state-permission','1-990965','address',:address,'1-990965',33554431)", ['address' => self::ADDRESS]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $stateProof = $this->createMock(AddressRegistrationProofManager::class);
            $stateProof->expects($this->never())->method('readContext');
            $stateProof->method('readState')->willReturn($context + ['permissions' => '33554431']);
            $device = json_decode($manager->getRegistrationStatus('1-990965', self::ADDRESS, $stateProof, true)->getContent(), true);
            $this->assertSame('33554431', $device['data']['indexed']['permissions']);
            $this->assertSame('33554431', $device['data']['chain']['permissions']);
            $this->assertSame('3353011', $device['meta']['height']);
            $security = $this->createStub(\Symfony\Bundle\SecurityBundle\Security::class);
            $request = \Symfony\Component\HttpFoundation\Request::create('/api/player-address/permissions', 'PUT', [], [], [], [],
                json_encode(['address' => self::ADDRESS, 'permissions' => '0']));
            $retired = $manager->setAddressPermissions($request, $security);
            $this->assertSame(410, $retired->getStatusCode());
            $this->assertSame(33554431, $db->fetchOne("SELECT val FROM permission WHERE id='device-state-permission'"), 'HTTP cannot change the chain projection');
            $db->executeStatement('RESET ROLE');
            $db->executeStatement("DELETE FROM structs.permission WHERE id='device-state-permission'");
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $device = json_decode($manager->getRegistrationStatus('1-990965', self::ADDRESS, $stateProof, true)->getContent(), true);
            $this->assertSame('0', $device['data']['indexed']['permissions'], 'Missing native permission row represents zero, not a guessed default grant');

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.player_address SET player_id='1-990966' WHERE address=:address", ['address' => self::ADDRESS]);
            $db->executeStatement('DELETE FROM sync_state.economy_contract');
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $body = json_decode($manager->getRegistrationStatus('1-990965', self::ADDRESS, $proof)->getContent(), true);
            $this->assertFalse($body['meta']['transaction_ready']);
            $this->assertSame('1-990966', $body['data']['indexed']['player_id'], 'Do not infer the indexed owner from the requested player');
            $this->assertSame(404, $manager->getRegistrationStatus('1-990965', self::ADDRESS, $stateProof, true)->getStatusCode(),
                'Device state never reports another player\'s device');
            $this->assertSame('1-990965', $body['data']['chain']['registered_player_id']);
            $unavailable = $this->createStub(AddressRegistrationProofManager::class);
            $unavailable->method('readContext')->willThrowException(new UnexpectedValueException('Unpinned native response'));
            $this->assertSame(503, $manager->getRegistrationStatus('1-990965', self::ADDRESS, $unavailable)->getStatusCode());
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
