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
     * Floored display fields stay for existing clients. `_p` columns are raw
     * precision values cast to text. Commission_p is the unscaled 0–1 rate.
     * No defusion end-height column is available on infusion (defusion table
     * only exposes completed_at/created_at).
     *
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
              floor(COALESCE(i.fuel, 0)) AS fuel,
              COALESCE(i.fuel_p, 0)::text AS fuel_p,
              floor(COALESCE(i.defusing, 0)) AS defusing,
              COALESCE(i.defusing_p, 0)::text AS defusing_p,
              floor(COALESCE(i.power, 0)) AS power,
              COALESCE(i.power_p, 0)::text AS power_p,
              floor(COALESCE(i.ratio, 0) * 100) AS ratio,
              COALESCE(i.ratio_p, 0)::text AS ratio_p,
              floor(COALESCE(i.commission, 0) * 100) AS commission,
              COALESCE(i.commission, 0)::text AS commission_p,
              i.created_at,
              i.updated_at,
              g.join_infusion_minimum,
              g.join_infusion_minimum_p::text AS join_infusion_minimum_p
            FROM player p
            INNER JOIN guild g
              ON p.guild_id = g.id
            LEFT JOIN infusion i
              ON g.primary_reactor_id = i.destination_id
              AND p.id = i.player_id
              AND i.destination_type = \'reactor\'
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