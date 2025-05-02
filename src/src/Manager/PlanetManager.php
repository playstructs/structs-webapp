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
}