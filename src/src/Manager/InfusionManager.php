<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class InfusionManager
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
    public function getInfusionByPlayerId(string $player_id): Response
    {
        $query = '
            SELECT
              i.destination_id,
              i.address,
              i.destination_type,
              i.player_id,
              COALESCE(i.fuel, 0) AS fuel,
              COALESCE(i.defusing, 0) AS defusing,
              COALESCE(i.power, 0) AS power,
              COALESCE(i.ratio, 0) AS ratio,
              COALESCE(i.commission, 0) AS commission,
              i.created_at,
              i.updated_at,
              g.join_infusion_minimum
            FROM player p
            INNER JOIN guild g
              ON p.guild_id = g.id
            LEFT JOIN infusion i
              ON g.primary_reactor_id = i.destination_id
              AND p.id = i.player_id 
            WHERE p.id = :player_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }
}