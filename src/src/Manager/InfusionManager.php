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
        ValidatorInterface $validator,
        private ?ReactorVaultManager $vaultPositions = null
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
              g.primary_reactor_id AS destination_id,
              p.primary_address AS address,
              i.destination_type,
              p.id AS player_id,
              COALESCE(i.fuel_p, 0)::text AS fuel_p,
              COALESCE(i.power_p, 0)::text AS power_p,
              COALESCE(i.defusing_p, 0)::text AS defusing_p,
              COALESCE(i.commission, 0)::text AS position_commission,
              g.join_infusion_minimum_p::text AS join_infusion_minimum_p,
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
              AND p.primary_address = i.address
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
            }
            $responseContent->success = true;
        });

        if (($responseContent->meta['protocol'] ?? null) === 'v0.22.0') {
            if (is_array($responseContent->data)) {
                $this->vaultPositions?->apply($responseContent->data, $responseContent->meta, $db);
            }
            $positionsMeta = $responseContent->data['positions_meta'] ?? [];
            if (in_array($positionsMeta['reason'] ?? null, ['vault_unindexed', 'vault_evidence_unavailable'], true)) {
                // The retained rows alone cannot certify total applied power at
                // an as-yet-unresolved canonical vault address.
                $positionsMeta['power_ready'] = false;
                $responseContent->data['positions_meta'] = $positionsMeta;
                foreach (['power_p', 'owner_power_p', 'power', 'owner_power'] as $field) {
                    $responseContent->data[$field] = null;
                }
            }
            $responseContent->meta['transaction_ready'] = ($responseContent->meta['transaction_ready'] ?? false)
                && ($positionsMeta['complete'] ?? false) && ($positionsMeta['power_ready'] ?? false);
        }

        return new JsonResponse($responseContent);
    }
}
