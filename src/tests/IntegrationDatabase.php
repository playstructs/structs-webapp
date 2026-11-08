<?php

namespace App\Tests;

use Doctrine\DBAL\DriverManager;
use LogicException;

/** Reject shared databases before any integration fixture can change a row. */
class IntegrationDatabase
{
    public static function assertDisposable(string $url): void
    {
        $db = DriverManager::getConnection(['url' => $url]);
        try {
            $name = $db->fetchOne('SELECT current_database()');
            $marker = $db->fetchOne("SELECT current_setting('structs.test_fixture', true)");
            if (!preg_match('/\Awebapp_test_[a-z0-9_]+\z/', $name) || $marker !== 'disposable-v022') {
                throw new LogicException('Integration tests require a marked disposable database; run tools/api/php-integration.cjs');
            }
        } finally {
            $db->close();
        }
    }
}
