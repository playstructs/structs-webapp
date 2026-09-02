<?php

use App\Constant\PaginationLimits;
use PHPUnit\Framework\TestCase;

class PaginationLimitsTest extends TestCase
{
    public function testClampCapsAtMax(): void
    {
        $this->assertSame(100, PaginationLimits::clamp(null));
        $this->assertSame(100, PaginationLimits::clamp(0));
        $this->assertSame(1, PaginationLimits::clamp(1));
        $this->assertSame(1000, PaginationLimits::clamp(5000));
        $this->assertSame(50, PaginationLimits::clamp(null, PaginationLimits::LEADERBOARD_DEFAULT));
    }

    /** Callers hand it raw query-string values, so it has to absorb those directly. */
    public function testClampAcceptsRawQueryStringValues(): void
    {
        $this->assertSame(100, PaginationLimits::clamp(''));
        $this->assertSame(25, PaginationLimits::clamp('25'));
        $this->assertSame(1000, PaginationLimits::clamp('99999'));
        $this->assertSame(100, PaginationLimits::clamp('-5'));
    }
}
