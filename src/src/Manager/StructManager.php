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
            SELECT s.*, COALESCE(sa.val, 0) AS health
            FROM struct s
            LEFT JOIN struct_attribute sa
              ON s.id = sa.object_id
              AND sa.attribute_type = \'health\'
            WHERE 
              s.location_id = :planet_id
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
}