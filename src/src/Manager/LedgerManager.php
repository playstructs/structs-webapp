<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Dto\ApiResponseContentDto;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use App\Util\ResponseMetaUtil;
use App\Util\ConsistentRead;
use App\Util\TransferSourceQuery;
use App\Util\ExactAmount;
use UnexpectedValueException;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class LedgerManager
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
     * @param int $page
     * @return Response
     * @throws Exception
     */
    public function getTransactions(
        string $player_id,
        int $page
    ): Response {
        $limit = PaginationLimits::DEFAULT;
        $offset = ($page - 1) * $limit;

        $query = "
            SELECT
              l.id::text AS id,
              l.address,
              l.counterparty,
              l.amount,
              l.amount_p::text AS amount_p,
              l.block_height::text AS block_height,
              l.chain_id, l.tx_index, l.msg_index, l.event_index,
              l.denom, 
              l.action,
              l.direction,
              l.time
            FROM ledger l
            WHERE EXISTS (SELECT 1 FROM structs.asset_owner o
                WHERE o.address=l.address AND o.owner_type='player' AND o.owner_id=:player_id)
            AND l.action IN ('sent', 'received')
            AND l.denom = 'ualpha'
            AND l.amount > 0
            ORDER BY l.time DESC, l.id DESC
            LIMIT $limit
            OFFSET :offset;
        ";

        $requestParams = [
            ApiParameters::PLAYER_ID => $player_id,
            ApiParameters::OFFSET => $offset
        ];
        $requiredFields = [
            ApiParameters::PLAYER_ID,
            ApiParameters::OFFSET
        ];

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
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function countTransactions(string $player_id): Response
    {
        $countQuery = "
            SELECT COUNT(*) AS count
            FROM ledger l
            WHERE EXISTS (SELECT 1 FROM structs.asset_owner o
                WHERE o.address=l.address AND o.owner_type='player' AND o.owner_id=:player_id)
            AND l.action IN ('sent', 'received')
            AND l.denom = 'ualpha'
            AND l.amount > 0;
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOneStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $countQuery,
            $requestParams,
            $requiredFields,
            'inventory'
        );
    }

    /**
     * @param string $tx_id
     * @return Response
     * @throws Exception
     */
    public function getTransaction(string $tx_id): Response
    {
        $query = '
            SELECT
              l.id::text AS id,
              l.address,
              l.counterparty,
              l.amount,
              l.amount_p::text AS amount_p,
              l.block_height::text AS block_height,
              l.chain_id, l.tx_index, l.msg_index, l.event_index,
              l.denom, 
              l.action,
              l.direction,
              l.time,
              p.id AS counterparty_player_id,
              p.username AS counterparty_username
            FROM ledger l
            LEFT JOIN structs.asset_owner o
              ON l.counterparty = o.address AND o.owner_type = \'player\'
            LEFT JOIN player p
              ON o.owner_id = p.id
            WHERE l.id = :tx_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::TX_ID => $tx_id];
        $requiredFields = [ApiParameters::TX_ID];

        return $this->queryOneStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields,
            'inventory'
        );
    }

    /** Match a sent leg to verified inclusion coordinates; missing/ambiguous is not completion. */
    public function getTransferSource(string $playerId, array $query): Response
    {
        $content = new ApiResponseContentDto();
        try {
            $params = TransferSourceQuery::parse($playerId, $query);
        } catch (UnexpectedValueException $error) {
            $content->errors = ['invalid_transfer_source' => $error->getMessage()];
            return new JsonResponse($content, Response::HTTP_BAD_REQUEST);
        }

        $db = $this->entityManager->getConnection();
        ConsistentRead::run($db, function () use ($db, $params, $content): void {
            $content->meta = ResponseMetaUtil::snapshotMeta($db, 'inventory');
            $content->success = true;
            $match = ['ready' => false, 'reason' => 'indexed_state_unavailable', 'required_height' => $params['block_height']];
            if (($content->meta['data_ready'] ?? false) === true && ($content->meta['chain_id'] ?? null) === $params['chain_id']) {
                $height = ExactAmount::unsigned($content->meta['height'] ?? null, '9223372036854775807');
                if (strlen($height) < strlen($params['block_height'])
                    || (strlen($height) === strlen($params['block_height']) && strcmp($height, $params['block_height']) < 0)) {
                    $match['reason'] = 'not_indexed';
                } else {
                    $selectors = '';
                    foreach (['msg_index', 'event_index'] as $name) {
                        if (array_key_exists($name, $params)) {
                            $selectors .= " AND l.{$name}=:{$name}";
                        }
                    }
                    // Exact source time prunes Timescale chunks and uses the
                    // existing source-event index. Never scan history by amount.
                    $rows = $db->fetchAllAssociative("SELECT l.id::text AS id, l.address, l.counterparty,
                            l.amount, l.amount_p::text AS amount_p, l.denom, l.action, l.direction, l.time,
                            l.chain_id, l.block_height::text AS block_height, l.tx_index, l.msg_index, l.event_index
                        FROM structs.ledger l
                        WHERE l.time=CAST(:block_time AS timestamptz) AND l.chain_id=:chain_id
                            AND l.block_height=:block_height AND l.tx_index=:tx_index
                            AND l.address=:address AND l.counterparty=:counterparty
                            AND l.denom=:denom AND l.amount_p=CAST(:amount_p AS numeric)
                            AND l.action='sent' AND l.direction='debit'
                            AND EXISTS (SELECT 1 FROM structs.asset_owner o WHERE o.address=l.address
                                AND o.owner_type='player' AND o.owner_id=:player_id)
                            {$selectors}
                        ORDER BY l.msg_index, l.event_index, l.id LIMIT 2", $params);
                    $match['reason'] = count($rows) === 0 ? 'not_found' : (count($rows) === 1 ? null : 'ambiguous');
                    if (count($rows) === 1) {
                        $content->data = $rows[0];
                        $match['ready'] = true;
                    }
                }
            }
            $content->meta['transfer_source'] = $match;
        });

        return new JsonResponse($content, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    public function getLedgerStats(?string $bucket, ?string $denom): Response
    {
        $responseContent = new ApiResponseContentDto();
        $params = [ApiParameters::BUCKET => $bucket, ApiParameters::DENOM => $denom];
        $parsedRequest = $this->apiRequestParsingManager->parse($params, [], [ApiParameters::BUCKET, ApiParameters::DENOM]);
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $trunc = ($bucket === '1h') ? 'hour' : 'day';
        $denomSql = '';
        $queryParams = [];
        if ($denom !== null && $denom !== '') {
            $denomSql = 'AND denom = :denom';
            $queryParams['denom'] = $denom;
        }

        $sql = "SELECT date_trunc('{$trunc}', time) AS bucket,
                action::text AS action,
                denom,
                SUM(amount_p)::text AS volume,
                count(*) AS count
            FROM structs.ledger
            WHERE time >= NOW() - INTERVAL '30 days'
            {$denomSql}
            GROUP BY bucket, action, denom
            ORDER BY bucket, action";

        $db = $this->entityManager->getConnection();
        $responseContent->data = $db->fetchAllAssociative($sql, $queryParams);
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
