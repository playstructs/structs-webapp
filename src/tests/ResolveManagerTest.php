<?php

use App\Tests\ApiManagerTestCase;
use App\Manager\ResolveManager;
use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\Response;

class ResolveManagerTest extends ApiManagerTestCase
{
    /**
     * The contract has to be resolvable without client-side knowledge: base denoms
     * with their exponents, guild denoms discovered at runtime, the state-suffix
     * rule as data, and a defined fallback for denoms the registry hasn't cached.
     */
    public function testDenomPublishesMachineReadableContract(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())->method('fetchAllAssociative')->willReturn([
            // guild_meta.denom is jsonb and comes off the wire as a string.
            ['id' => '0-1', 'symbols' => '{"0": "eep", "6": "bleep"}'],
            ['id' => '0-2', 'symbols' => null],
        ]);
        $connection->method('fetchAssociative')->willReturn(['height' => 1]);

        $response = (new ResolveManager($this->entityManager($connection), $this->validator()))->getDenoms();
        $content = json_decode($response->getContent(), true);
        $units = array_column($content['data']['units'], null, 'denom');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $this->assertSame(6, $units['ualpha']['exponent']);
        $this->assertSame('alpha', $units['ualpha']['display']);
        $this->assertSame('mass', $units['ualpha']['quantity']);
        $this->assertSame(0, $units['ore']['exponent']);

        // alpha is never a denomination of its own, only the display of ualpha.
        $this->assertArrayNotHasKey('alpha', $units);

        // Guild denoms carry the same 1e6 exponent and lose the leading u for display,
        // with the guild's branded symbols exposed as the scale when it registered any.
        $this->assertSame(6, $units['uguild.0-1']['exponent']);
        $this->assertSame('guild.0-1', $units['uguild.0-1']['display']);
        $this->assertSame(
            [['exponent' => 0, 'symbol' => 'eep'], ['exponent' => 6, 'symbol' => 'bleep']],
            $units['uguild.0-1']['scale']
        );
        $this->assertSame('guild.0-2', $units['uguild.0-2']['display']);
        $this->assertArrayNotHasKey('scale', $units['uguild.0-2']);

        $this->assertSame(['infused', 'defusing'], $content['data']['state_suffixes']);
        $this->assertSame(0, $content['data']['unknown_denom']['exponent']);
        $this->assertSame('_p', $content['data']['precision_suffix']);

        $this->assertSame('milliwatt', $content['data']['bases']['energy']['denom']);
        $this->assertSame(3, $content['data']['bases']['energy']['exponent']);
        $this->assertTrue($content['data']['bases']['energy']['connection_capacity_is_player_share']);
    }

    public function testResolveNameSearchIncludesSubstation(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        (new ResolveManager($this->entityManager($connection), $this->validator()))->resolve('orbital');

        $this->assertStringContainsString('structs.substation', $captured);
        $this->assertStringContainsString('structs.player', $captured);
        $this->assertStringContainsString('structs.guild', $captured);
    }

    /** 10-1 must resolve as a provider, not as player 0-1. */
    public function testObjectKeyPrefixesAreLongestFirst(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->method('fetchAssociative')->willReturn(['id' => '10-1']);

        $response = (new ResolveManager($this->entityManager($connection), $this->validator()))->resolve('10-1');
        $content = json_decode($response->getContent(), true);

        $this->assertSame('provider', $content['data'][0]['type']);
    }
}
