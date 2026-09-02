<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Dto\ApiResponseContentDto;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use App\Util\ResponseMetaUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class InventoryManager
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
     * @throws Exception
     */
    public function inventoryByDenom(string $denom, int $page, ?string $limit): Response
    {
        [$pageLimit, $offset] = $this->limitOffset($page, $limit);
        $sql = "SELECT owner_type::text AS owner_type, owner_id, denom, balance::text AS balance
            FROM structs.api_inventory
            WHERE denom = :denom
            ORDER BY balance DESC, owner_type, owner_id
            LIMIT {$pageLimit} OFFSET {$offset}";
        $params = [ApiParameters::DENOM => $denom, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::DENOM, ApiParameters::PAGE];

        return $this->queryAllStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $sql,
            $params,
            $required,
            'inventory'
        );
    }

    /**
     * @throws Exception
     */
    public function inventoryByOwner(string $owner_type, string $owner_id): Response
    {
        $sql = "SELECT owner_type::text AS owner_type, owner_id, denom, balance::text AS balance
            FROM structs.api_inventory
            WHERE owner_type = CAST(:owner_type AS structs.object_type)
            AND owner_id = :owner
            ORDER BY denom";
        $params = [ApiParameters::OWNER_TYPE => $owner_type, ApiParameters::OWNER => $owner_id];
        $required = [ApiParameters::OWNER_TYPE, ApiParameters::OWNER];

        return $this->queryAllStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $sql,
            $params,
            $required,
            'inventory'
        );
    }

    /**
     * @throws Exception
     */
    public function getGuildBank(): Response
    {
        $sql = "SELECT guild_id, denom, collateral::text AS collateral, supply::text AS supply, ratio
            FROM structs.api_guild_bank
            ORDER BY guild_id, denom";

        return $this->queryAllStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $sql,
            [],
            [],
            'guild_bank'
        );
    }

    /**
     * @throws Exception
     */
    public function getGuildBankHistory(string $guild_id, ?string $bucket): Response
    {
        $responseContent = new ApiResponseContentDto();
        $params = [ApiParameters::GUILD_ID => $guild_id, ApiParameters::BUCKET => $bucket];
        $required = [ApiParameters::GUILD_ID];
        $optional = [ApiParameters::BUCKET];
        $parsedRequest = $this->apiRequestParsingManager->parse($params, $required, $optional);
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $trunc = ($bucket === '1h') ? 'hour' : 'day';
        $sql = "SELECT date_trunc('{$trunc}', l.time) AS bucket,
                l.action::text AS action,
                l.denom,
                SUM(CASE WHEN l.direction = 'debit' THEN l.amount_p * -1 ELSE l.amount_p END)::text AS volume
            FROM structs.ledger l
            WHERE l.action IN ('minted', 'burned', 'infused', 'defusion_completed')
            AND (
                l.denom = 'uguild.' || :guild_id
                OR l.denom LIKE 'uguild.' || :guild_id || '.%'
            )
            AND l.time >= NOW() - INTERVAL '30 days'
            GROUP BY bucket, l.action, l.denom
            ORDER BY bucket, l.action";

        $db = $this->entityManager->getConnection();
        $responseContent->data = $db->fetchAllAssociative($sql, ['guild_id' => $guild_id]);
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function limitOffset(int $page, ?string $limit): array
    {
        $pageLimit = PaginationLimits::clamp($limit);
        $page = max(1, $page);
        $offset = ($page - 1) * $pageLimit;

        return [$pageLimit, $offset];
    }
}
