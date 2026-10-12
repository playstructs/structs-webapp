<?php declare(strict_types=1);

namespace App\Tests\Matrix;

use App\Matrix\SignInRateLimiter;
use App\Matrix\UsedSignatureRegistry;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;

class SignInGuardsTest extends TestCase
{
    public function testASignatureCanBeClaimedOnce(): void
    {
        $registry = new UsedSignatureRegistry(new ArrayAdapter());

        self::assertTrue($registry->claim('sig-a'));
        self::assertFalse($registry->claim('sig-a'));
        self::assertTrue($registry->claim('sig-b'));
    }

    public function testTheAddressLimitAppliesPerAddress(): void
    {
        $limiter = new SignInRateLimiter(new ArrayAdapter());

        for ($i = 0; $i < SignInRateLimiter::ADDRESS_LIMIT; $i++) {
            self::assertNull($limiter->attempt('structs1aaa', '10.0.0.' . $i));
        }

        self::assertNotNull($limiter->attempt('structs1aaa', '10.0.0.99'));
        self::assertNull($limiter->attempt('structs1bbb', '10.0.0.100'), 'Another address is unaffected');
    }

    public function testTheIpLimitAppliesAcrossAddresses(): void
    {
        $limiter = new SignInRateLimiter(new ArrayAdapter());

        for ($i = 0; $i < SignInRateLimiter::IP_LIMIT; $i++) {
            self::assertNull($limiter->attempt('structs1addr' . $i, '203.0.113.7'));
        }

        $wait = $limiter->attempt('structs1fresh', '203.0.113.7');

        self::assertNotNull($wait);
        self::assertGreaterThan(0, $wait);
        self::assertLessThanOrEqual(SignInRateLimiter::WINDOW_SECONDS, $wait);
    }

    public function testAnEmptyIpIsNotCounted(): void
    {
        $limiter = new SignInRateLimiter(new ArrayAdapter());

        for ($i = 0; $i < SignInRateLimiter::IP_LIMIT + 5; $i++) {
            self::assertNull($limiter->attempt('structs1addr' . $i, ''));
        }
    }
}
