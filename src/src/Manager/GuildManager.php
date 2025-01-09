<?php

namespace App\Manager;

use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class GuildManager
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
     * @return Response
     * @throws Exception
     */
    public function getGuildFilterList(): Response
    {
        $query = '
            SELECT
              gm.id,
              gm.name
            FROM guild_meta gm
            INNER JOIN player p
              ON gm.id = p.guild_id
            GROUP BY gm.id, gm.name
            ORDER BY gm.name;
        ';

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }
}