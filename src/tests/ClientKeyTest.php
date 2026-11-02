<?php

use App\Util\ClientKey;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

class ClientKeyTest extends TestCase
{
    private function key(string $ip): string
    {
        return ClientKey::fromRequest(Request::create('/', server: ['REMOTE_ADDR' => $ip]));
    }

    public function testIpv6ClientsShareTheirSlash64(): void
    {
        $this->assertSame('2001:db8:1:2::/64', $this->key('2001:db8:1:2::1'));
        $this->assertSame('2001:db8:1:2::/64', $this->key('2001:db8:1:2:ffff:ffff:ffff:ffff'));
        $this->assertSame('2001:db8:1:3::/64', $this->key('2001:db8:1:3::1'));
    }

    public function testIpv4AndMappedAddressesAreExact(): void
    {
        $this->assertSame('192.0.2.7', $this->key('192.0.2.7'));
        $this->assertSame('192.0.2.7', $this->key('::ffff:192.0.2.7'));
        $this->assertNotSame($this->key('::ffff:192.0.2.7'), $this->key('::ffff:192.0.2.8'));
    }

    public function testMissingRequestHasOneSharedKey(): void
    {
        $this->assertSame('unavailable', ClientKey::fromRequest(null));
    }
}
