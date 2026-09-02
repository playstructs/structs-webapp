<?php

namespace App\Tests;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Shared scaffolding for manager tests that drive a mocked DBAL connection.
 */
abstract class ApiManagerTestCase extends KernelTestCase
{
    protected function entityManager(Connection $connection): EntityManagerInterface
    {
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);

        return $entityManager;
    }

    protected function validator(): ValidatorInterface
    {
        return Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    /**
     * Returns a connection whose first fetchAllAssociative call records the SQL it
     * was given, so a test can assert on the query the manager composed.
     */
    protected function capturingConnection(?string &$captured, array $rows = []): Connection
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturnCallback(function (string $sql) use (&$captured, $rows) {
                $captured = $sql;

                return $rows;
            });
        $connection->method('fetchAssociative')->willReturn(['source_height' => 1]);

        return $connection;
    }
}
