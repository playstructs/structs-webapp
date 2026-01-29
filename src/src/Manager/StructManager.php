<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StructManager
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
     * @param string $planet_id
     * @return Response
     * @throws Exception
     */
    public function getAllStructsOnPlanet(string $planet_id): Response
    {
        $query = '
            SELECT 
              s.*, 
              COALESCE(sa_health.val, 0) AS health,
              COALESCE(sa_status.val, 0) AS status,
              sd_is_defender.protected_struct_id,
              to_jsonb(COALESCE((SELECT array_agg(sd.defending_struct_id ORDER BY sd.defending_struct_id ASC)
               FROM struct_defender sd
               WHERE sd.protected_struct_id = s.id), ARRAY[]::text[])) AS defending_struct_ids
            FROM struct s
            LEFT JOIN struct_attribute sa_health
              ON s.id = sa_health.object_id
              AND sa_health.attribute_type = \'health\'
            LEFT JOIN struct_attribute sa_status
              ON s.id = sa_status.object_id
              AND sa_status.attribute_type = \'status\'
            LEFT JOIN struct_defender sd_is_defender
              ON s.id = sd_is_defender.defending_struct_id
            WHERE 
              s.is_destroyed = false
              AND s.location_id = :planet_id
              OR s.location_id in (
                SELECT fleet.id
                FROM structs.fleet
                WHERE fleet.location_id = :planet_id
              )
            ORDER BY s.slot;
        ';

        $requestParams = [ApiParameters::PLANET_ID => $planet_id];
        $requiredFields = [ApiParameters::PLANET_ID];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getStructsByPlayerId(string $player_id): Response
    {
        $query = '
            SELECT 
              s.*, 
              COALESCE(sa_health.val, 0) AS health,
              COALESCE(sa_status.val, 0) AS status,
              sd_is_defender.protected_struct_id,
              to_jsonb(COALESCE((SELECT array_agg(sd.defending_struct_id ORDER BY sd.defending_struct_id ASC)
               FROM struct_defender sd
               WHERE sd.protected_struct_id = s.id), ARRAY[]::text[])) AS defending_struct_ids
            FROM struct s
            LEFT JOIN struct_attribute sa_health
              ON s.id = sa_health.object_id
              AND sa_health.attribute_type = \'health\'
            LEFT JOIN struct_attribute sa_status
              ON s.id = sa_status.object_id
              AND sa_status.attribute_type = \'status\'
            LEFT JOIN struct_defender sd_is_defender
              ON s.id = sd_is_defender.defending_struct_id
            WHERE s.owner = :player_id
            AND s.is_destroyed = false
            ORDER BY s.location_type, s.location_id, s.slot;
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
     * @param string $struct_id
     * @return Response
     * @throws Exception
     */
    public function getStruct(string $struct_id): Response
    {
        $query = '
            SELECT 
              s.*, 
              COALESCE(sa_health.val, 0) AS health,
              COALESCE(sa_status.val, 0) AS status,
              sd_is_defender.protected_struct_id,
              to_jsonb(COALESCE((SELECT array_agg(sd.defending_struct_id ORDER BY sd.defending_struct_id ASC)
               FROM struct_defender sd
               WHERE sd.protected_struct_id = s.id), ARRAY[]::text[])) AS defending_struct_ids
            FROM struct s
            LEFT JOIN struct_attribute sa_health
              ON s.id = sa_health.object_id
              AND sa_health.attribute_type = \'health\'
            LEFT JOIN struct_attribute sa_status
              ON s.id = sa_status.object_id
              AND sa_status.attribute_type = \'status\'
            LEFT JOIN struct_defender sd_is_defender
              ON s.id = sd_is_defender.defending_struct_id
            WHERE s.id = :struct_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::STRUCT_ID => $struct_id];
        $requiredFields = [ApiParameters::STRUCT_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @return Response
     * @throws Exception
     */
    public function getAllStructTypes(): Response
    {
        $query = '
            SELECT *
            FROM struct_type
            ORDER BY id;
        ';

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }
}