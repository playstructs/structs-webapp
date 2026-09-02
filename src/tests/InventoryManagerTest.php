<?php

use App\Tests\ApiManagerTestCase;
use App\Manager\InventoryManager;

class InventoryManagerTest extends ApiManagerTestCase
{
    /** Balances exceed the float-safe range, so they cross the wire as strings. */
    public function testBalanceIsText(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        (new InventoryManager($this->entityManager($connection), $this->validator()))
            ->inventoryByOwner('player', '1-1');

        $this->assertStringContainsString('balance::text AS balance', $captured);
    }

    /** Guild bank volume aggregates the precise column, matching its ualpha denom label. */
    public function testGuildBankHistoryAggregatesPreciseAmounts(): void
    {
        $captured = null;
        $connection = $this->capturingConnection($captured);

        (new InventoryManager($this->entityManager($connection), $this->validator()))
            ->getGuildBankHistory('0-1', '1d');

        $this->assertStringContainsString('l.amount_p', $captured);
        $this->assertStringNotContainsString('l.amount ', $captured);
    }
}
