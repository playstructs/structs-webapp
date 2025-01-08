<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerManager
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
    public function getPlayer(string $player_id): Response
    {
        $query = '
            SELECT
              p.id,
              p.primary_address,
              p.guild_id,
              p.substation_id,
              p.planet_id,
              p.fleet_id,
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
              gm.tag,
              COALESCE((
                SELECT vpi.balance
                FROM view.player_inventory vpi
                WHERE vpi.player_id=p.id
                AND vpi.denom=\'alpha\'
              ), 0) as alpha,
              COALESCE((
                SELECT g.val 
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'ore\'
              ), 0) as ore,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'load\'
              ), 0) as load,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'structsLoad\'
              ), 0) as structs_load,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'capacity\'
              ), 0) as capacity,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.substation_id
                AND g.attribute_type=\'connectionCapacity\'
              ), 0) as connection_capacity
            FROM player p
            LEFT JOIN guild_meta gm
              ON p.guild_id = gm.id
            LEFT JOIN player_meta pm
              ON p.id = pm.id
              AND p.guild_id = pm.guild_id
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