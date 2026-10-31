<?php

use App\Entity\Player;
use App\Manager\PlayerAddressManager;
use App\Tests\ApiManagerTestCase;
use Doctrine\DBAL\DriverManager;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;

class DeviceMetadataDatabaseTest extends ApiManagerTestCase
{
    private function security(string $id): Security
    {
        $player = new Player();
        $player->setId($id);
        $security = $this->createStub(Security::class);
        $security->method('getUser')
            ->willReturn($player);
        return $security;
    }

    private function request(string $address, string $guild = '0-990967', ?string $agent = 'device test'): Request
    {
        return Request::create(
            '/api/player-address/meta',
            'POST',
            [],
            [],
            [],
            [
                'REMOTE_ADDR' => '192.0.2.10',
                'HTTP_X_FORWARDED_FOR' => '198.51.100.20',
            ],
            json_encode([
                'address' => $address,
                'guild_id' => $guild,
                'user_agent' => $agent,
            ])
        );
    }

    public function testPrivateMetadataIsOwnedAndWorksWithTheRestrictedRole(): void
    {
        if (!$url = getenv('INTEGRATION_DATABASE_URL')) {
            $this->markTestSkipped('Requires the disposable Sqitch database');
        }
        $db = DriverManager::getConnection(['url' => $url]);
        $db->beginTransaction();
        try {
            // Fixtures: two players, a revoked address, and a permission on the owned address.
            $db->executeStatement('SET LOCAL search_path=cache,public,structs');
            $db->executeStatement(
                "INSERT INTO player(id,guild_id,primary_address)
                VALUES ('1-990967','0-990967','metadataown'),('1-990968','0-990967','metadataother')"
            );
            $db->executeStatement(
                "INSERT INTO player_address(address,player_id,guild_id,status) VALUES
                ('metadatarevoked','1-990967','0-990967','revoked')"
            );
            $db->executeStatement(
                "INSERT INTO permission(id,object_id,object_type,object_index,player_id,val)
                VALUES('device-metadata-permission','1-990967','address','metadataown','1-990967',33554431)"
            );
            $db->executeStatement('SET LOCAL ROLE structs_webapp');

            $manager = new PlayerAddressManager($this->entityManager($db), $this->validator());
            $owner = $this->security('1-990967');
            $other = $this->security('1-990968');

            // Writes: only the owner, for an active address in its own guild.
            $this->assertSame(201, $manager->addPlayerAddressMeta($this->request('metadataown'), $owner)->getStatusCode());
            $this->assertSame(
                '192.0.2.10',
                $db->fetchOne("SELECT ip FROM player_address_meta WHERE address='metadataown'"),
                'Untrusted forwarding header is not the client address'
            );
            $this->assertSame(
                201,
                $manager->addPlayerAddressMeta($this->request('metadataown', agent: 'updated'), $owner)->getStatusCode()
            );
            $this->assertSame(
                'updated',
                $db->fetchOne("SELECT user_agent FROM player_address_meta WHERE address='metadataown'")
            );
            $this->assertSame(403, $manager->addPlayerAddressMeta($this->request('metadataown'), $other)->getStatusCode());
            $this->assertSame(403, $manager->addPlayerAddressMeta($this->request('metadataother'), $owner)->getStatusCode());
            $this->assertSame(
                403,
                $manager->addPlayerAddressMeta($this->request('metadataown', '0-990968'), $owner)->getStatusCode()
            );
            $this->assertSame(
                403,
                $manager->addPlayerAddressMeta($this->request('metadatarevoked'), $owner)->getStatusCode()
            );
            $this->assertSame(
                403,
                $manager->addPlayerAddressMeta($this->request('metadatamissing'), $owner)->getStatusCode()
            );
            $this->assertSame(
                1,
                (int) $db->fetchOne("SELECT count(*) FROM player_address_meta WHERE address LIKE 'metadata%'")
            );

            // Reads: owner-only and never cached.
            $list = $manager->getAddressList('1-990967', $owner);
            $this->assertSame(200, $list->getStatusCode());
            $this->assertStringContainsString('no-store', $list->headers->get('Cache-Control'));
            $rows = json_decode($list->getContent(), true)['data'];
            $this->assertCount(1, $rows);
            $this->assertSame('33554431', $rows[0]['permissions']);
            $this->assertSame('updated', $rows[0]['user_agent']);
            $this->assertSame(403, $manager->getAddressList('1-990967', $other)->getStatusCode());
            $this->assertSame(403, $manager->countPlayerAddresses('1-990967', $other)->getStatusCode());
            $this->assertSame(
                1,
                json_decode($manager->countPlayerAddresses('1-990967', $owner)->getContent(), true)['data']['count']
            );
            $details = $manager->getAddressDetails('metadataown', $owner);
            $this->assertStringContainsString('no-store', $details->headers->get('Cache-Control'));
            $this->assertSame('updated', json_decode($details->getContent(), true)['data']['user_agent']);
            $this->assertNull(
                json_decode($manager->getAddressDetails('metadataown', $other)->getContent(), true)['data']
            );
            $this->assertNull(
                json_decode($manager->getAddressDetails('metadatarevoked', $owner)->getContent(), true)['data']
            );

            // A missing user agent clears the stored one.
            $this->assertSame(
                201,
                $manager->addPlayerAddressMeta($this->request('metadataown', agent: null), $owner)->getStatusCode()
            );
            $this->assertNull($db->fetchOne("SELECT user_agent FROM player_address_meta WHERE address='metadataown'"));
        } finally {
            $db->rollBack();
            $db->close();
        }
    }
}
