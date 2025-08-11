<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlanetManager
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
    public function getPlanet(string $planet_id): Response
    {
        $query = '
            SELECT 
              p.id,
              p.owner,
              p.map,
              p.space_slots,
              p.air_slots,
              p.land_slots,
              p.water_slots,
              pm.name,
              COALESCE((
                SELECT g.val 
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'ore\'
              ), 0) as undiscovered_ore
            FROM planet p
            LEFT JOIN planet_meta pm
              ON p.id = pm.id
            WHERE p.id = :planet_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::PLANET_ID => $planet_id];
        $requiredFields = [ApiParameters::PLANET_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    public function calcPlanetaryShieldHealth(
        int $planetaryShield,
        int $blockStartRaid,
        int $currentBlock
    ): int {
        $scale = 8;
        $planetaryShield = strval(max($planetaryShield, 1));
        $blockStartRaid = strval($blockStartRaid);
        $currentBlock = strval($currentBlock);
        // min((1 - ($currentBlock - $blockStartRaid) / $planetaryShield) * 100, 0)
        $health = bcmul(bcsub('1', bcdiv(bcsub($currentBlock, $blockStartRaid, $scale), $planetaryShield, $scale),
            $scale), 100, $scale);
        return ceil(max($health, 0));
    }

    /**
     * @param string $planet_id
     * @return Response
     * @throws Exception
     */
    public function getPlanetaryShieldHealth(string $planet_id): Response
    {
        $query = '
            SELECT
              p.id AS planet_id,
              COALESCE(pa_ps.val, 100) AS planetary_shield,
              COALESCE(pa_bsr.val, cb.height) AS block_start_raid,
              cb.height AS current_block
            FROM planet p
            LEFT JOIN planet_attribute pa_ps
              ON pa_ps.object_id = p.id
              AND pa_ps.attribute_type = \'planetaryShield\'
            LEFT JOIN planet_attribute pa_bsr
              ON pa_ps.object_id= pa_bsr.object_id
              AND pa_bsr.attribute_type = \'blockStartRaid\'
            CROSS JOIN current_block cb
            WHERE 
              p.id = :planet_id
        ';

        $requestParams = [ApiParameters::PLANET_ID => $planet_id];
        $requiredFields = [ApiParameters::PLANET_ID];

        /** @var JsonResponse $response */
        $response = $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );

        $responseContent = json_decode($response->getContent(), true);

        if ($responseContent['success'] === false || empty($responseContent['data'])) {
            return $response;
        }

        $responseContent['data'] = [
            'health' => $this->calcPlanetaryShieldHealth(
                $responseContent['data']['planetary_shield'],
                $responseContent['data']['block_start_raid'],
                $responseContent['data']['current_block']
            )
        ];
        $response->setData($responseContent);

        return $response;
    }

    /**
     * @param string $planet_id
     * @return Response
     * @throws Exception
     */
    public function getPlanetaryShieldInfo(string $planet_id): Response
    {
        $query = '
            SELECT
              p.id AS planet_id,
              pa_ps.val AS planetary_shield,
              pa_bsr.val AS block_start_raid
            FROM planet p
            LEFT JOIN planet_attribute pa_ps
              ON pa_ps.object_id = p.id
              AND pa_ps.attribute_type = \'planetaryShield\'
            LEFT JOIN planet_attribute pa_bsr
              ON pa_ps.object_id= pa_bsr.object_id
              AND pa_bsr.attribute_type = \'blockStartRaid\'
            WHERE p.id = :planet_id
        ';

        $requestParams = [ApiParameters::PLANET_ID => $planet_id];
        $requiredFields = [ApiParameters::PLANET_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $planet_id
     * @return Response
     * @throws Exception
     */
    public function getActivePlanetRaidByPlanetId(string $planet_id): Response
    {
        $query = '
            SELECT
              pr.planet_id,
              pr.fleet_id,
              pr.status,
              pr.updated_at,
              f.owner AS fleet_owner
            FROM planet_raid pr
            INNER JOIN fleet f
              ON pr.fleet_id = f.id
            WHERE pr.planet_id = :planet_id
            AND pr.status IN (\'initiated\', \'ongoing\')
            ORDER BY pr.updated_at DESC
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::PLANET_ID => $planet_id];
        $requiredFields = [ApiParameters::PLANET_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $fleet_id
     * @return Response
     * @throws Exception
     */
    public function getActivePlanetRaidByFleetId(string $fleet_id): Response
    {
        $query = '
            SELECT
              pr.planet_id,
              pr.fleet_id,
              pr.status,
              pr.updated_at,
              p.owner AS planet_owner
            FROM planet_raid pr
            INNER JOIN planet p
              ON pr.planet_id = p.id
            WHERE pr.fleet_id = :fleet_id
            AND pr.status IN (\'initiated\', \'ongoing\')
            ORDER BY pr.updated_at DESC
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::FLEET_ID => $fleet_id];
        $requiredFields = [ApiParameters::FLEET_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }
}