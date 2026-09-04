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
              COALESCE(sa_status.val, CASE WHEN s.is_destroyed THEN 32 ELSE 0 END) AS status,
              CASE
                WHEN sd_is_defender.protected_struct_id IS NOT NULL
                 AND (
                      s.location_id = ps.location_id
                   OR (s.location_type = \'fleet\' AND ps.location_type = \'planet\' AND s_fleet.location_id = ps.location_id)
                   OR (s.location_type = \'planet\' AND ps.location_type = \'fleet\' AND ps_fleet.location_id = s.location_id)
                 )
                THEN sd_is_defender.protected_struct_id
              END AS protected_struct_id,
              to_jsonb(COALESCE((SELECT array_agg(sd.defending_struct_id ORDER BY sd.defending_struct_id ASC)
               FROM struct_defender sd
               INNER JOIN struct d
                 ON d.id = sd.defending_struct_id
               LEFT JOIN fleet d_fleet
                 ON d.location_type = \'fleet\'
                 AND d_fleet.id = d.location_id
               WHERE sd.protected_struct_id = s.id
               AND (
                    d.location_id = s.location_id
                 OR (d.location_type = \'fleet\' AND s.location_type = \'planet\' AND d_fleet.location_id = s.location_id)
                 OR (d.location_type = \'planet\' AND s.location_type = \'fleet\' AND s_fleet.location_id = d.location_id)
               )), ARRAY[]::text[])) AS defending_struct_ids,
              CASE
                WHEN COALESCE(st.power_generation, \'noPowerGeneration\') <> \'noPowerGeneration\' THEN UNIT_LEGACY_FORMAT(COALESCE((SELECT val FROM grid WHERE attribute_type = \'fuel\' AND object_id = s.id), 0), \'ualpha\')
                ELSE 0
              END AS fuel
            FROM struct s
            INNER JOIN struct_type st
              ON s.type = st.id
            LEFT JOIN struct_attribute sa_health
              ON s.id = sa_health.object_id
              AND sa_health.attribute_type = \'health\'
            LEFT JOIN struct_attribute sa_status
              ON s.id = sa_status.object_id
              AND sa_status.attribute_type = \'status\'
            LEFT JOIN struct_defender sd_is_defender
              ON s.id = sd_is_defender.defending_struct_id
            LEFT JOIN struct ps
              ON ps.id = sd_is_defender.protected_struct_id
            LEFT JOIN fleet s_fleet
              ON s.location_type = \'fleet\'
              AND s_fleet.id = s.location_id
            LEFT JOIN fleet ps_fleet
              ON ps.location_type = \'fleet\'
              AND ps_fleet.id = ps.location_id
            WHERE s.owner = :player_id
            AND (
              s.is_destroyed = false 
              OR s.destroyed_block + (
                SELECT "value"::BIGINT
                FROM setting
                WHERE name = \'STRUCT_SWEEP_DELAY\'
                LIMIT 1
              ) >= (
                SELECT height::BIGINT 
                FROM current_block
                LIMIT 1
              )
            )
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
              COALESCE(sa_status.val, CASE WHEN s.is_destroyed THEN 32 ELSE 0 END) AS status,
              CASE
                WHEN sd_is_defender.protected_struct_id IS NOT NULL
                 AND (
                      s.location_id = ps.location_id
                   OR (s.location_type = \'fleet\' AND ps.location_type = \'planet\' AND s_fleet.location_id = ps.location_id)
                   OR (s.location_type = \'planet\' AND ps.location_type = \'fleet\' AND ps_fleet.location_id = s.location_id)
                 )
                THEN sd_is_defender.protected_struct_id
              END AS protected_struct_id,
              to_jsonb(COALESCE((SELECT array_agg(sd.defending_struct_id ORDER BY sd.defending_struct_id ASC)
               FROM struct_defender sd
               INNER JOIN struct d
                 ON d.id = sd.defending_struct_id
               LEFT JOIN fleet d_fleet
                 ON d.location_type = \'fleet\'
                 AND d_fleet.id = d.location_id
               WHERE sd.protected_struct_id = s.id
               AND (
                    d.location_id = s.location_id
                 OR (d.location_type = \'fleet\' AND s.location_type = \'planet\' AND d_fleet.location_id = s.location_id)
                 OR (d.location_type = \'planet\' AND s.location_type = \'fleet\' AND s_fleet.location_id = d.location_id)
               )), ARRAY[]::text[])) AS defending_struct_ids,
              CASE
                WHEN COALESCE(st.power_generation, \'noPowerGeneration\') <> \'noPowerGeneration\' THEN UNIT_LEGACY_FORMAT(COALESCE((SELECT val FROM grid WHERE attribute_type = \'fuel\' AND object_id = s.id), 0), \'ualpha\')
                ELSE 0
              END AS fuel
            FROM struct s
            INNER JOIN struct_type st
              ON s.type = st.id    
            LEFT JOIN struct_attribute sa_health
              ON s.id = sa_health.object_id
              AND sa_health.attribute_type = \'health\'
            LEFT JOIN struct_attribute sa_status
              ON s.id = sa_status.object_id
              AND sa_status.attribute_type = \'status\'
            LEFT JOIN struct_defender sd_is_defender
              ON s.id = sd_is_defender.defending_struct_id
            LEFT JOIN struct ps
              ON ps.id = sd_is_defender.protected_struct_id
            LEFT JOIN fleet s_fleet
              ON s.location_type = \'fleet\'
              AND s_fleet.id = s.location_id
            LEFT JOIN fleet ps_fleet
              ON ps.location_type = \'fleet\'
              AND ps_fleet.id = ps.location_id
            WHERE s.id = :struct_id
            AND (
              s.is_destroyed = false 
              OR s.destroyed_block + (
                SELECT "value"::BIGINT
                FROM setting
                WHERE name = \'STRUCT_SWEEP_DELAY\'
                LIMIT 1
              ) >= (
                SELECT height::BIGINT 
                FROM current_block
                LIMIT 1
              )
            )
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

    /**
     * @throws Exception
     */
    public function getStructStatusCounts(): Response
    {
        $query = '
            SELECT
              count(*) FILTER (WHERE materialized) AS materialized,
              count(*) FILTER (WHERE built) AS built,
              count(*) FILTER (WHERE online) AS online,
              count(*) FILTER (WHERE stored) AS stored,
              count(*) FILTER (WHERE hidden) AS hidden,
              count(*) FILTER (WHERE destroyed) AS destroyed,
              count(*) FILTER (WHERE locked) AS locked,
              count(*) AS total
            FROM view.struct_status
        ';

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [],
            []
        );
    }

    /**
     * @throws Exception
     */
    public function countStructs(?string $isDestroyed): Response
    {
        if ($isDestroyed === '0' || $isDestroyed === '1') {
            return $this->queryOne(
                $this->entityManager,
                $this->apiRequestParsingManager,
                'SELECT count(*) AS count FROM struct WHERE is_destroyed = (:is_destroyed = \'1\')',
                [ApiParameters::IS_DESTROYED => $isDestroyed],
                [ApiParameters::IS_DESTROYED]
            );
        }

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            'SELECT count(*) AS count FROM struct',
            [],
            []
        );
    }
}