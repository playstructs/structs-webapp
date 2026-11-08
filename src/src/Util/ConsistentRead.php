<?php

namespace App\Util;

use Doctrine\DBAL\Connection;
use LogicException;
use Throwable;

/** Keep response data and its source watermarks in one database snapshot. */
class ConsistentRead
{
    public static function run(Connection $db, callable $read): mixed
    {
        if ($db->isTransactionActive()) {
            // A savepoint inside READ COMMITTED does not stabilize later reads.
            $isolation = $db->fetchOne('SHOW transaction_isolation');
            if (!in_array($isolation, ['repeatable read', 'serializable'], true)) {
                throw new LogicException('A consistent API read requires a repeatable snapshot');
            }

            return $read();
        }

        $db->beginTransaction();
        try {
            $db->executeStatement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
            $result = $read();
            $db->commit();

            return $result;
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
    }
}
