<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Dto\ApiResponseContentDto;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use App\Util\ConsistentRead;
use App\Util\ResponseMetaUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
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
              floor(COALESCE(i.fuel, 0)) AS fuel,
              floor(COALESCE(i.defusing, 0)) AS defusing,
              floor(COALESCE(i.power, 0)) AS power,
              floor(COALESCE(i.ratio, 0) * 100) AS ratio,
              floor(COALESCE(i.commission, 0) * 100) AS commission,
              i.created_at,
              i.updated_at,
              g.join_infusion_minimum
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

        $responseContent = new ApiResponseContentDto();
        $parsedRequest = $this->apiRequestParsingManager->parse($requestParams, $requiredFields);
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $params = $this->getQueryParams($requiredFields, $parsedRequest);
        $db = $this->entityManager->getConnection();
        ConsistentRead::run($db, function () use ($db, $query, $params, $responseContent): void {
            $responseContent->meta = ResponseMetaUtil::snapshotMeta($db, 'inventory');
            if (($responseContent->meta['protocol'] ?? null) === 'v0.21.0') {
                $row = $db->fetchAssociative($query, $params);
                $responseContent->data = $row === false ? null : $row;
            } else {
                $row = $db->fetchOne('SELECT structs.api_player_reactor(:player_id)::text', $params);
                $responseContent->data = is_string($row)
                    ? json_decode($row, true, 512, JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING)
                    : null;
                $positionsMeta = $responseContent->data['positions_meta'] ?? [];
                $responseContent->meta['transaction_ready'] = ($responseContent->meta['transaction_ready'] ?? false)
                    && ($positionsMeta['complete'] ?? false) && ($positionsMeta['power_ready'] ?? false);
            }
            $responseContent->success = true;
        });

        return new JsonResponse($responseContent);
    }
}
