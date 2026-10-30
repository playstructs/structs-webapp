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

    private const string GENERATOR_TOTALS = '
              SELECT COALESCE(sum(i.fuel_p), 0) AS fuel_p,
                COALESCE(sum(i.power_p), 0) AS power_p,
                COALESCE(bool_and(
                  i.destination_type IS NOT NULL AND i.destination_type = \'struct\'
                  AND i.fuel_p IS NOT NULL AND i.power_p IS NOT NULL AND i.ratio_p IS NOT NULL
                  AND i.commission IS NOT NULL AND i.generator_disabled IS NOT NULL
                  AND i.fuel_p BETWEEN 0 AND 18446744073709551615 AND mod(i.fuel_p, 1) = 0
                  AND i.power_p BETWEEN 0 AND 18446744073709551615 AND mod(i.power_p, 1) = 0
                  AND i.ratio_p BETWEEN 0 AND 18446744073709551615 AND mod(i.ratio_p, 1) = 0
                  AND i.commission BETWEEN 0 AND 1
                  AND i.fuel_p * i.ratio_p <= 18446744073709551615
                  AND i.power_p = CASE WHEN i.generator_disabled THEN 0 ELSE i.fuel_p * i.ratio_p END
                ), TRUE) AS positions_ready
              FROM structs.infusion i
              WHERE i.destination_id = s.id
    ';

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
              END AS fuel,
              totals.positions_ready AS generator_positions_ready,
              CASE WHEN totals.positions_ready THEN totals.fuel_p::text END AS generator_fuel_p,
              CASE WHEN totals.positions_ready THEN totals.power_p::text END AS generator_power_p
            FROM struct s
            INNER JOIN struct_type st
              ON s.type = st.id
            CROSS JOIN LATERAL (' . self::GENERATOR_TOTALS . ') totals
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

        return $this->queryAllStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields,
            'inventory'
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
              END AS fuel,
              totals.positions_ready AS generator_positions_ready,
              CASE WHEN totals.positions_ready THEN totals.fuel_p::text END AS generator_fuel_p,
              CASE WHEN totals.positions_ready THEN totals.power_p::text END AS generator_power_p
            FROM struct s
            INNER JOIN struct_type st
              ON s.type = st.id    
            CROSS JOIN LATERAL (' . self::GENERATOR_TOTALS . ') totals
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

        return $this->queryOneStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields,
            'inventory'
        );
    }

    /**
     * Exact applied output and one funding position in the same indexed snapshot.
     * The address is a read selector; callers must resolve spend authority on chain.
     *
     * @throws Exception
     */
    public function getGeneratorSnapshot(string $struct_id, ?string $address): Response
    {
        $query = '
            SELECT s.id AS struct_id, :address::text AS source_address,
              CASE WHEN totals.positions_ready THEN totals.fuel_p::text END AS fuel_p,
              CASE WHEN totals.positions_ready THEN totals.power_p::text END AS power_p,
              totals.positions_ready,
              (position.address IS NOT NULL) AS source_exists,
              position.fuel_p::text AS source_fuel_p,
              position.power_p::text AS source_power_p,
              position.ratio_p::text AS source_ratio_p,
              position.commission::text AS source_commission,
              position.generator_disabled AS source_generator_disabled,
              COALESCE(NULLIF(position.owner_id, \'\'), position.player_id) AS source_recorded_owner_id
            FROM structs.struct s
            CROSS JOIN LATERAL (' . self::GENERATOR_TOTALS . '
            ) totals
            LEFT JOIN structs.infusion position
              ON position.destination_id = s.id AND position.address = :address
            WHERE s.id = :struct_id
        ';

        return $this->queryOneStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            [ApiParameters::STRUCT_ID => $struct_id, ApiParameters::ADDRESS => $address],
            [ApiParameters::STRUCT_ID, ApiParameters::ADDRESS],
            'inventory'
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

        return $this->queryAllStamped(
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
