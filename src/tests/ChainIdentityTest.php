<?php

use App\Util\ChainIdentity;
use PHPUnit\Framework\TestCase;

class ChainIdentityTest extends TestCase
{
    public function testObjectIdsHaveANonzeroUint64Index(): void
    {
        $this->assertTrue(ChainIdentity::isObjectId('1-1', 1));
        $this->assertTrue(ChainIdentity::isObjectId('1-18446744073709551615', 1));
        $this->assertFalse(ChainIdentity::isObjectId('1-18446744073709551616', 1));
        $this->assertFalse(ChainIdentity::isObjectId('1-0', 1));
        $this->assertFalse(ChainIdentity::isObjectId('1-01', 1));
        $this->assertFalse(ChainIdentity::isObjectId('2-1', 1));
        $this->assertFalse(ChainIdentity::isObjectId("1-1\n", 1));
        $this->assertFalse(ChainIdentity::isObjectId(1, 1));
    }

    public function testAddressesUseTheCanonicalBech32Alphabet(): void
    {
        $this->assertTrue(ChainIdentity::isAddress('structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a'));
        $this->assertTrue(ChainIdentity::isAddress('structsvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a', 'structsvaloper'));
        $this->assertFalse(ChainIdentity::isAddress('structsvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60a'));
        $this->assertFalse(ChainIdentity::isAddress('structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz60b1'));
        $this->assertFalse(ChainIdentity::isAddress('structs19rl4cm2hmr8afy4kldpxz3fka4jguq0acpz6Oa'));
        $this->assertFalse(ChainIdentity::isAddress(null));
    }
}
