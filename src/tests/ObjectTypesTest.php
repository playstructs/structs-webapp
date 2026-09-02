<?php

use App\Constant\ObjectTypes;
use PHPUnit\Framework\TestCase;

class ObjectTypesTest extends TestCase
{
    /**
     * ALL is a literal because attributes need a constant expression, so it can
     * drift from PREFIXES unless something checks.
     */
    public function testAllMatchesPrefixValues(): void
    {
        $fromPrefixes = array_values(ObjectTypes::PREFIXES);
        sort($fromPrefixes);
        $all = ObjectTypes::ALL;
        sort($all);

        $this->assertSame($fromPrefixes, $all);
    }

    public function testPrefixesAreLongestFirst(): void
    {
        $keys = array_keys(ObjectTypes::PREFIXES);
        $multiCharPositions = [];
        foreach ($keys as $position => $key) {
            if (strlen($key) > 1) {
                $multiCharPositions[] = $position;
            }
        }

        // 10 and 11 must be tested before 1, or 10-1 parses as a player.
        $this->assertSame([0, 1], $multiCharPositions);
    }
}
