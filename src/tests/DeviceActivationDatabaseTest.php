<?php

use App\Entity\Player;
use App\Manager\AddressRegistrationProofManager;
use App\Manager\PlayerAddressManager;
use App\Manager\SignatureValidationManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\DriverManager;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;

class DeviceActivationDatabaseTest extends ApiManagerTestCase
{
    private const string ADDRESS = 'structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a';
    private const string APPROVER = 'structs15mjft6pe6vlplh70fulqmqprmjdjgn8k3l7fpn';

    private function security(string $id): Security
    {
        $player = new Player();
        $player->setId($id);
        $security = $this->createStub(Security::class);
        $security->method('getUser')->willReturn($player);
        return $security;
    }

    private function request(array $values): Request
    {
        return Request::create('/api/auth/player-address', 'POST', [], [], [], [], json_encode($values));
    }

    public function testProofStorageCodeBindingAndOwnerIsolationWithWebappPrivileges(): void
    {
        if (!$url = getenv('INTEGRATION_DATABASE_URL')) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->setNestTransactionsWithSavepoints(true);
        $db->beginTransaction();
        try {
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement("INSERT INTO structs.guild(id) VALUES('0-990960'),('0-990961')");
            $db->executeStatement("INSERT INTO structs.player(id,guild_id,primary_address)
                VALUES('1-990960','0-990960','devicefixtureprimary'),('1-990961','0-990961','devicefixtureother')");
            $db->executeStatement("INSERT INTO structs.player_address(address,player_id,guild_id,status)
                VALUES(:address,'1-990960','0-990960','approved')", ['address' => self::APPROVER]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $manager = new PlayerAddressManager($this->entityManager($db), $this->validator());
            $owner = $this->security('1-990960');
            $other = $this->security('1-990961');
            $create = $this->request(['logged_in_address' => self::APPROVER, 'guild_id' => '0-990960']);
            $this->assertSame(400, $manager->createPlayerAddressActivationCode($create, $other)->getStatusCode());
            $response = $manager->createPlayerAddressActivationCode($create, $owner);
            $this->assertSame(201, $response->getStatusCode(), $response->getContent());
            $code = json_decode($response->getContent(), true)['data']['code'];
            $values = ['player_id' => '1-990960', 'guild_id' => '0-990960', 'code' => $code,
                'address' => self::ADDRESS, 'signature' => str_repeat('a', 128), 'pubkey' => '02' . str_repeat('b', 64)];
            $context = ['chain_id' => 'structstestnet-111', 'protocol' => 'v0.22.0', 'source_height' => '3353010',
                'player_id' => $values['player_id'], 'address' => self::ADDRESS, 'proof_nonce' => '9007199254740993',
                'registered_player_id' => '', 'timeout_height' => '0'];
            $proof = $this->createStub(AddressRegistrationProofManager::class);
            $proof->method('readContext')->willReturn($context);
            $signature = $this->createMock(SignatureValidationManager::class);
            $signature->method('validate')->willReturnCallback(function ($address, $pubkey, $signature, $message) use ($context) {
                $this->assertSame(AddressRegistrationProofManager::message($context), $message);
                return true;
            });
            foreach ([['player_id' => '1-990961'], ['guild_id' => '0-990961']] as $patch) {
                $this->assertSame(409, $manager->addPendingAddress($this->request(array_replace($values, $patch)), $signature, $proof)->getStatusCode());
            }
            $response = $manager->addPendingAddress($this->request($values), $signature, $proof);
            $this->assertSame(202, $response->getStatusCode(), $response->getContent());
            $this->assertSame(202, $manager->addPendingAddress($this->request($values), $signature, $proof)->getStatusCode(), 'Retry preserves one consent');
            $this->assertSame('1', (string) $db->fetchOne('SELECT count(*) FROM player_address_pending WHERE code = :code', ['code' => $code]));
            $pending = json_decode($manager->getPendingAddressByCode($code, $owner)->getContent(), true)['data'];
            $this->assertSame('9007199254740993', $pending['proof_nonce']);
            $this->assertSame('3353010', $pending['proof_height']);
            $this->assertSame('0', $pending['proof_timeout_height']);
            $this->assertNull(json_decode($manager->getPendingAddressByCode($code, $other)->getContent(), true)['data']);

            $permissions = $this->request(['code' => $code, 'address' => self::ADDRESS, 'permissions' => '255']);
            $this->assertSame(404, $manager->setPendingAddressPermissions($permissions, $other)->getStatusCode());
            $this->assertSame(200, $manager->setPendingAddressPermissions($permissions, $owner)->getStatusCode());
            $this->assertSame(255, $db->fetchOne('SELECT permissions FROM player_address_pending WHERE code = :code', ['code' => $code]));
            $invalid = $this->request(['code' => $code, 'address' => self::ADDRESS, 'permissions' => '4294967295']);
            $this->assertSame(400, $manager->setPendingAddressPermissions($invalid, $owner)->getStatusCode());
            $replacement = array_replace($values, ['signature' => str_repeat('b', 128)]);
            $this->assertSame(409, $manager->addPendingAddress($this->request($replacement), $signature, $proof)->getStatusCode());

            $db->executeStatement('RESET ROLE');
            $db->executeStatement("UPDATE structs.player_address_activation_code SET created_at=now()-interval '61 minutes' WHERE code=:code", ['code' => $code]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $this->assertNull(json_decode($manager->getPendingAddressByCode($code, $owner)->getContent(), true)['data']);
            $this->assertSame(409, $manager->addPendingAddress($this->request($values), $signature, $proof)->getStatusCode());
            $this->assertSame(404, $manager->setPendingAddressPermissions($permissions, $owner)->getStatusCode());

            $db->executeStatement('RESET ROLE');
            $db->executeStatement('UPDATE structs.player_address_activation_code SET created_at=now() WHERE code=:code', ['code' => $code]);
            $db->executeStatement("UPDATE structs.player_address SET player_id='1-990961',guild_id='0-990961' WHERE address=:address", ['address' => self::APPROVER]);
            $db->executeStatement('SET LOCAL ROLE structs_webapp');
            $this->assertNull(json_decode($manager->getPendingAddressByCode($code, $owner)->getContent(), true)['data']);
            $this->assertSame(409, $manager->addPendingAddress($this->request($values), $signature, $proof)->getStatusCode());
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
