<?php

namespace App\Tests;

use Doctrine\DBAL\Connection;

/** Synthetic block evidence for API fixtures, not a writer-ingestion test. */
class ReadinessFixture
{
    public static function economyCoverage(Connection $db): void
    {
        if (!$db->isTransactionActive()) {
            throw new \LogicException('Readiness fixtures require an enclosing test transaction');
        }
        $db->executeStatement("UPDATE sync_state.sync_cursor SET last_block_hash=repeat('A',64)");
        $db->executeStatement('DELETE FROM sync_state.economy_contract');
        $db->executeStatement("INSERT INTO sync_state.economy_contract(chain_id,contract,activation_height,last_height,last_block_hash)
            SELECT chain_id,'events-v022-1',3353000,last_height,last_block_hash
            FROM sync_state.sync_cursor WHERE chain_id='structstestnet-111' AND last_height>=3353000");
    }
}
