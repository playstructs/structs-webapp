<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
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
}