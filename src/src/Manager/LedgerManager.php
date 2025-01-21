<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class LedgerManager
{
    use ApiSqlQueryTrait;

    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public ConstraintViolationUtil $constraintViolationUtil;

    public ApiRequestParsingManager $apiRequestParsingManager;

    public function __construct(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ) {
        $this->entityManager = $entityManager;
        $this->validator = $validator;
        $this->constraintViolationUtil = new ConstraintViolationUtil();
        $this->apiRequestParsingManager = new ApiRequestParsingManager(
            $this->validator,
            $this->constraintViolationUtil
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getTransactions(string $player_id): Response
    {
        $query = '
            SELECT
              l.id,
              l.address,
              l.counterparty,
              l.amount,
              l.denom, 
              l.action,
              l.direction,
              l.time
            FROM ledger l
            INNER JOIN player_address pa
              ON l.address = pa.address
            WHERE pa.player_id = :player_id
            AND l.action IN (\'sent\', \'received\')
            AND l.denom = \'alpha\'
            ORDER BY l.time DESC;
        ';

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $tx_id
     * @return Response
     * @throws Exception
     */
    public function getTransaction(string $tx_id): Response
    {
        $query = '
            SELECT
              id,
              address,
              counterparty,
              amount,
              denom, 
              "action",
              direction,
              "time"
            FROM ledger
            WHERE id = :tx_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::TX_ID => $tx_id];
        $requiredFields = [ApiParameters::TX_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }
}