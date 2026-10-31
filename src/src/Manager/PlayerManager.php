<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Constant\RegexPattern;
use App\Dto\ApiResponseContentDto;
use App\Entity\Player;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use App\Util\ConsistentRead;
use App\Util\ResponseMetaUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerManager
{
    use ApiSqlQueryTrait;

    /** Lookback, in blocks, for the active-player count when window_blocks is omitted. */
    private const int DEFAULT_ACTIVE_WINDOW_BLOCKS = 16363;

    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public ConstraintViolationUtil $constraintViolationUtil;

    public ApiRequestParsingManager $apiRequestParsingManager;

    private VaultFundsManager $vaultFunds;

    public function __construct(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        ?VaultFundsManager $vaultFunds = null
    ) {
        $this->entityManager = $entityManager;
        $this->validator = $validator;
        $this->vaultFunds = $vaultFunds ?? new VaultFundsManager();
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
    public function getPlayer(string $player_id): Response
    {
        $query = '
            SELECT
              p.id,
              p.primary_address,
              v.address AS _vault_address,
              v.account_created AS _vault_account_created,
              COALESCE(vi.balance, 0)::text AS _vault_balance_p,
              COALESCE((
                SELECT jsonb_agg(candidate)
                FROM (
                  SELECT a.address, count(*) OVER ()::text AS candidate_count
                  FROM structs.player_address a
                  JOIN structs.api_inventory funds ON funds.owner_type = \'address\'
                    AND funds.owner_id = a.address AND funds.denom = \'ualpha\'
                  WHERE a.player_id = p.id AND a.status = \'approved\'
                    AND a.address IS DISTINCT FROM v.address AND funds.balance > 0
                  ORDER BY funds.balance DESC, a.address COLLATE "C"
                  LIMIT 16
                ) candidate
              ), \'[]\'::jsonb) AS _retained_funding_sources,
              p.guild_id,
              p.substation_id,
              p.planet_id,
              p.fleet_id,
              (
                SELECT row_to_json(ft) as fleet
                FROM (
                    SELECT * 
                    FROM fleet 
                    WHERE id = p.fleet_id
                    LIMIT 1
                ) ft 
                LIMIT 1
              ) as fleet,
              p.username,
              p.pfp,
              p.pfp_client_render_attributes,
              COALESCE(NULLIF(gu.name, \'\'), gm.name) AS guild_name,
              gm.tag,
              COALESCE((
                SELECT vpi.balance
                FROM view.player_inventory vpi
                WHERE vpi.player_id=p.id
                AND vpi.denom=\'alpha\'
              ), 0) as alpha,
              COALESCE((
                SELECT g.val 
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'ore\'
              ), 0) as ore,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'load\'
              ), 0) as load,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'structsLoad\'
              ), 0) as structs_load,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.id
                AND g.attribute_type=\'capacity\'
              ), 0) as capacity,
              COALESCE((
                SELECT g.val
                FROM grid g
                WHERE g.object_id=p.substation_id
                AND g.attribute_type=\'connectionCapacity\'
              ), 0) as connection_capacity
            FROM player p
            LEFT JOIN structs.vault v ON v.owner_id = p.id
            LEFT JOIN structs.api_inventory vi ON vi.owner_type = \'address\'
              AND vi.owner_id = v.address AND vi.denom = \'ualpha\'
            LEFT JOIN guild gu
              ON p.guild_id = gu.id
            LEFT JOIN guild_meta gm
              ON gu.id = gm.id
            WHERE p.id = :player_id
            LIMIT 1;
        ';

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        [$responseContent, $status] = $this->runQuery(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields,
            false,
            'inventory',
            true
        );
        // The SQL snapshot is closed before any narrowly scoped chain fallback.
        // Every fallback query must prove that same indexed height.
        if ($responseContent->success && is_array($responseContent->data)) {
            $this->vaultFunds->apply($responseContent->data, $responseContent->meta);
        }

        return new JsonResponse($responseContent, $status);
    }

    /**
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function raidSearch(Request $request): Response
    {
        $apiFilterParams = [
            ApiParameters::SEARCH_STRING => RegexPattern::SEARCH_STRING_FILTER
        ];

        $request = $this->apiRequestParsingManager->filterRequestParams(
            $request,
            $apiFilterParams
        );

        $apiRequestParams = [
            ApiParameters::GUILD_ID => $request->query->get(ApiParameters::GUILD_ID),
            ApiParameters::MIN_ORE => $request->query->get(ApiParameters::MIN_ORE),
            ApiParameters::SEARCH_STRING => $request->query->get(ApiParameters::SEARCH_STRING),
            ApiParameters::FLEET_AWAY_ONLY => $request->query->get(ApiParameters::FLEET_AWAY_ONLY),
            ApiParameters::NOT_UNDER_ATTACK => $request->query->get(ApiParameters::NOT_UNDER_ATTACK),
            ApiParameters::COUNT_ONLY => $request->query->get(ApiParameters::COUNT_ONLY),
            ApiParameters::PAGE => $request->query->get(ApiParameters::PAGE),
        ];
        $apiRequiredParams = [];
        $apiOptionalParams = [
            ApiParameters::GUILD_ID,
            ApiParameters::MIN_ORE,
            ApiParameters::SEARCH_STRING,
            ApiParameters::FLEET_AWAY_ONLY,
            ApiParameters::NOT_UNDER_ATTACK,
            ApiParameters::COUNT_ONLY,
            ApiParameters::PAGE
        ];

        $parsedRequest = $this->apiRequestParsingManager->parse(
            $apiRequestParams,
            $apiRequiredParams,
            $apiOptionalParams
        );

        $responseContent = new ApiResponseContentDto();
        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $queryGuildIdFilter = '';
        $queryFleetAwayFilter = '';
        $queryNotUnderAttackFilter = '';
        $querySearchFilter = '';
        $limit = PaginationLimits::DEFAULT;
        $page = !empty($parsedRequest->params->page) ? $parsedRequest->params->page : 1;
        $offset = ($page - 1) * $limit;

        $session = $request->getSession();
        $player_id = $session->get('player_id');

        $queryParams = ['player_id' => $player_id];

        $queryParams['min_ore'] = $parsedRequest->params->min_ore ?? 0;

        if (isset($parsedRequest->params->guild_id)) {
            $queryParams['guild_id'] = $parsedRequest->params->guild_id;
            $queryGuildIdFilter = ' AND p.guild_id = :guild_id ';
        }

        if (
            isset($parsedRequest->params->fleet_away_only)
            && $parsedRequest->params->fleet_away_only === '1'
        ) {
            $queryFleetAwayFilter = ' AND f.status = \'away\' ';
        }

        if (
            isset($parsedRequest->params->not_under_attack)
            && $parsedRequest->params->not_under_attack === '1'
        ) {
            $queryNotUnderAttackFilter = "
                AND NOT EXISTS (
                    SELECT 1
                    FROM planet_raid pr
                    WHERE pr.planet_id = p.planet_id
                    AND pr.status IN ('initiated', 'ongoing', 'shieldsVulnerable')
                )
            ";
        }

        if (
            isset($parsedRequest->params->search_string)
            && $parsedRequest->params->search_string !== ''
        ) {
            $queryParams['search_string'] = $parsedRequest->params->search_string;
            $queryParams['like_search_string'] = "%{$parsedRequest->params->search_string}%";
            $querySearchFilter = "
                AND (
                    p.id = :search_string
                    OR p.username ILIKE :like_search_string
                    OR pa.address = :search_string
                )
            ";
        }

        $query = "
            SELECT
              p.id,
              p.planet_id,
              p.username,
              p.pfp,
              p.pfp_client_render_attributes,
              COALESCE(NULLIF(gu.name, ''), gm.name) AS guild_name,
              gm.tag,
              f.status AS fleet_status,
              COALESCE(planet_ore.val, 0) AS undiscovered_ore,
              COALESCE(player_ore.val, 0) AS ore,
              (
                EXISTS (
                    SELECT 1
                    FROM planet_raid pr
                    WHERE pr.planet_id = p.planet_id
                    AND pr.status IN ('initiated', 'ongoing', 'shieldsVulnerable')
                )
              )::int AS under_attack
            FROM player p
            INNER JOIN planet
              ON p.planet_id = planet.id
            LEFT JOIN player_address pa
              ON p.id = pa.player_id
            LEFT JOIN fleet f
              ON p.fleet_id = f.id
            LEFT JOIN guild gu
              ON p.guild_id = gu.id
            LEFT JOIN guild_meta gm
              ON gu.id = gm.id
            LEFT JOIN grid AS planet_ore
              ON planet_ore.object_id = p.planet_id
              AND planet_ore.attribute_type='ore'
            LEFT JOIN grid AS player_ore
              ON player_ore.object_id = p.id
              AND player_ore.attribute_type='ore'
            WHERE
              p.id <> :player_id
              AND (
                  player_ore.val >= :min_ore
                  OR (player_ore.val IS NULL AND 0 = :min_ore)
              )
              $queryGuildIdFilter
              $queryFleetAwayFilter
              $queryNotUnderAttackFilter
              $querySearchFilter
            GROUP BY
              p.id,
              p.username,
              p.pfp,
              p.pfp_client_render_attributes,
              guild_name,
              gm.tag,
              f.status,
              undiscovered_ore,
              ore
            LIMIT $limit
            OFFSET $offset;
        ";

        if ($parsedRequest->params->count_only) {
            $query = "
                SELECT COUNT(1)
                FROM (
                    SELECT
                      p.id
                    FROM player p
                    INNER JOIN planet
                      ON p.planet_id = planet.id
                    LEFT JOIN player_address pa
                      ON p.id = pa.player_id
                    LEFT JOIN fleet f
                      ON p.fleet_id = f.id
                    LEFT JOIN guild gu
                      ON p.guild_id = gu.id
                    LEFT JOIN guild_meta gm
                      ON gu.id = gm.id
                    LEFT JOIN grid AS planet_ore
                      ON planet_ore.object_id = p.planet_id
                      AND planet_ore.attribute_type='ore'
                    LEFT JOIN grid AS player_ore
                      ON player_ore.object_id = p.id
                      AND player_ore.attribute_type='ore'
                    WHERE
                      p.id <> :player_id
                      AND (
                          player_ore.val >= :min_ore
                          OR (player_ore.val IS NULL AND 0 = :min_ore)
                      )
                      $queryGuildIdFilter
                      $queryFleetAwayFilter
                      $queryNotUnderAttackFilter
                      $querySearchFilter
                    GROUP BY
                      p.id
                ) AS search_results
                LIMIT 1;
            ";
        }

        $db = $this->entityManager->getConnection();
        $result = $db->fetchAllAssociative($query, $queryParams);

        $responseContent->data = $result;
        $responseContent->success = true;

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @param Request $request
     * @return Response
     * @throws Exception
     */
    public function transferSearch(Request $request): Response
    {
        $apiFilterParams = [
            ApiParameters::SEARCH_STRING => RegexPattern::SEARCH_STRING_FILTER
        ];

        $request = $this->apiRequestParsingManager->filterRequestParams(
            $request,
            $apiFilterParams
        );

        $apiRequestParams = [
            ApiParameters::GUILD_ID => $request->query->get(ApiParameters::GUILD_ID),
            ApiParameters::SEARCH_STRING => $request->query->get(ApiParameters::SEARCH_STRING)
        ];
        $apiRequiredParams = [ApiParameters::SEARCH_STRING];
        $apiOptionalParams = [ApiParameters::GUILD_ID];

        $parsedRequest = $this->apiRequestParsingManager->parse(
            $apiRequestParams,
            $apiRequiredParams,
            $apiOptionalParams
        );

        $responseContent = new ApiResponseContentDto();
        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $queryParams = [
            'like_search_string' => '%' . $parsedRequest->params->search_string . '%'
        ];

        $queryGuildIdFilter = '';

        if (isset($parsedRequest->params->guild_id)) {
            $queryParams['guild_id'] = $parsedRequest->params->guild_id;
            $queryGuildIdFilter = ' AND p.guild_id = :guild_id ';
        }

        $query = "
            SELECT
              p.id,
              pa.address,
              v.address AS _vault_address,
              v.account_created AS _vault_account_created,
              COALESCE(vi.balance, 0)::text AS _vault_balance_p,
              p.username,
              p.pfp,
              p.pfp_client_render_attributes,
              COALESCE(NULLIF(gu.name, ''), gm.name) AS guild_name,
              gm.tag,
              COALESCE(vpi.balance, 0) as alpha
            FROM player_address pa
            INNER JOIN player p
              ON p.id = pa.player_id
            LEFT JOIN structs.vault v ON v.owner_id = p.id
            LEFT JOIN structs.api_inventory vi ON vi.owner_type = 'address'
              AND vi.owner_id = v.address AND vi.denom = 'ualpha'
            LEFT JOIN guild gu
              ON p.guild_id = gu.id
            LEFT JOIN guild_meta gm
              ON gu.id = gm.id
            LEFT JOIN view.player_inventory vpi
              ON p.id = vpi.player_id
              AND vpi.denom = 'alpha'
            WHERE pa.status = 'approved'
              AND pa.address ILIKE :like_search_string
              $queryGuildIdFilter
            UNION
            SELECT
              p.id,
              p.primary_address AS address,
              v.address AS _vault_address,
              v.account_created AS _vault_account_created,
              COALESCE(vi.balance, 0)::text AS _vault_balance_p,
              p.username,
              p.pfp,
              p.pfp_client_render_attributes,
              COALESCE(NULLIF(gu.name, ''), gm.name) AS guild_name,
              gm.tag,
              COALESCE(vpi.balance, 0) as alpha
            FROM player p
            LEFT JOIN structs.vault v ON v.owner_id = p.id
            LEFT JOIN structs.api_inventory vi ON vi.owner_type = 'address'
              AND vi.owner_id = v.address AND vi.denom = 'ualpha'
            LEFT JOIN guild gu
              ON p.guild_id = gu.id
            LEFT JOIN guild_meta gm
              ON gu.id = gm.id
            LEFT JOIN view.player_inventory vpi
              ON p.id = vpi.player_id
              AND vpi.denom = 'alpha'
            WHERE p.id ILIKE :like_search_string
              OR p.username ILIKE :like_search_string
              $queryGuildIdFilter
            LIMIT 25;
        ";

        $db = $this->entityManager->getConnection();
        ConsistentRead::run($db, function () use ($db, $query, $queryParams, $responseContent): void {
            $responseContent->data = $db->fetchAllAssociative($query, $queryParams);
            $responseContent->meta = ResponseMetaUtil::snapshotMeta($db, 'inventory');
            $responseContent->success = true;
        });
        // Search is a bounded indexed list, not one RPC fan-out per result.
        // Resolve uncertain spendability only when an individual is requested.
        $indexedFunds = new VaultFundsManager();
        foreach ($responseContent->data as &$player) {
            $meta = $responseContent->meta;
            $indexedFunds->apply($player, $meta);
        }
        unset($player);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getPlayerLastActionBlockHeight(string $player_id): Response
    {
        $query = "
            SELECT val AS last_action_block_height
            FROM grid
            WHERE object_id = :player_id
            AND attribute_type='lastAction'
            LIMIT 1;
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getPlayerOreStats(string $player_id): Response
    {
        $query = "
            SELECT
              player_address.player_id,
              COALESCE(SUM(CASE WHEN action = 'forfeited' THEN amount ELSE 0 END), 0) AS forfeited,
              COALESCE(SUM(CASE WHEN action = 'mined' THEN amount ELSE 0 END), 0) AS mined,
              COALESCE(SUM(CASE WHEN action = 'seized' THEN amount ELSE 0 END), 0) AS seized
            FROM ledger
            LEFT JOIN player_address
            ON player_address.address = ledger.address
            WHERE player_address.player_id = :player_id
            GROUP BY player_address.player_id
            LIMIT 1
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getPlayerPlanetsCompleted(string $player_id): Response
    {
        $query = "
            SELECT count(1) 
            FROM planet 
            WHERE status = 'complete' 
              AND owner = :player_id
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @param string $player_id
     * @return Response
     * @throws Exception
     */
    public function getPlayerRaidsLaunched(string $player_id): Response
    {
        $query = "
            SELECT count(1) 
            FROM planet_activity pa
            INNER JOIN fleet f
                ON f.id = pa.detail->>'fleet_id'
            WHERE pa.category = 'raid_status'
            AND pa.detail->>'status' = 'initiated'
            AND f.owner = :player_id
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * Raids won: raids the player's fleet completed (raidSuccessful), plus raids
     * on the player's planet that ended with the attacker defeated. A win counts
     * whether or not any ore changed hands.
     *
     * @throws Exception
     */
    public function getPlayerRaidsWon(string $player_id): Response
    {
        $query = "
            SELECT count(1)
            FROM planet_activity pa
            LEFT JOIN fleet f
                ON f.id = pa.detail->>'fleet_id'
            LEFT JOIN planet p
                ON p.id = pa.planet_id
            WHERE pa.category = 'raid_status'
            AND (
                (pa.detail->>'status' = 'raidSuccessful' AND f.owner = :player_id)
                OR (pa.detail->>'status' = 'attackerDefeated' AND p.owner = :player_id)
            )
        ";

        $requestParams = [ApiParameters::PLAYER_ID => $player_id];
        $requiredFields = [ApiParameters::PLAYER_ID];

        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * @throws Exception
     */
    public function countPlayers(): Response
    {
        return $this->queryOne(
            $this->entityManager,
            $this->apiRequestParsingManager,
            'SELECT count(*) AS count FROM player',
            [],
            []
        );
    }

    /**
     * @throws Exception
     */
    public function countActivePlayers(?string $windowBlocks): Response
    {
        $responseContent = new ApiResponseContentDto();
        $params = [ApiParameters::WINDOW_BLOCKS => $windowBlocks];
        $optional = [ApiParameters::WINDOW_BLOCKS];
        $parsedRequest = $this->apiRequestParsingManager->parse($params, [], $optional);
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $window = ($windowBlocks === null || $windowBlocks === '')
            ? self::DEFAULT_ACTIVE_WINDOW_BLOCKS
            : (int) $windowBlocks;
        $sql = "SELECT count(*) AS count
            FROM grid g
            CROSS JOIN current_block cb
            WHERE g.attribute_type = 'lastAction'
            AND g.object_type = 'player'
            AND g.val >= cb.height - :window_blocks";
        $db = $this->entityManager->getConnection();
        $row = $db->fetchAssociative($sql, ['window_blocks' => $window]);
        $responseContent->data = $row === false ? ['count' => 0] : $row;
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    /**
     * @throws Exception
     */
    public function getPlayerPower(string $player_id): Response
    {
        $sql = "
            SELECT
              vp.player_id,
              vp.capacity,
              vp.capacity_p,
              vp.connection_capacity,
              vp.connection_capacity_p,
              vp.load,
              vp.load_p,
              vp.structs_load,
              vp.structs_load_p,
              vp.total_load,
              vp.total_load_p,
              vp.total_capacity,
              vp.total_capacity_p,
              (vp.total_capacity - vp.total_load) AS margin,
              (vp.total_capacity_p - vp.total_load_p) AS margin_p,
              TRUE AS connection_capacity_is_player_share
            FROM view.player vp
            WHERE vp.player_id = :player_id
            LIMIT 1
        ";
        return $this->queryOneStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $sql,
            [ApiParameters::PLAYER_ID => $player_id],
            [ApiParameters::PLAYER_ID]
        );
    }

    /**
     * @throws Exception
     */
    public function getPlayersAtRisk(?string $limit): Response
    {
        $pageLimit = PaginationLimits::clamp($limit, 25);
        $sql = "
            SELECT
              vp.player_id,
              vp.username,
              vp.capacity,
              vp.capacity_p,
              vp.connection_capacity,
              vp.connection_capacity_p,
              vp.load,
              vp.load_p,
              vp.structs_load,
              vp.structs_load_p,
              vp.total_load,
              vp.total_load_p,
              vp.total_capacity,
              vp.total_capacity_p,
              (vp.total_capacity - vp.total_load) AS margin,
              (vp.total_capacity_p - vp.total_load_p) AS margin_p,
              TRUE AS connection_capacity_is_player_share
            FROM view.player vp
            ORDER BY margin ASC, vp.player_id
            LIMIT {$pageLimit}
        ";
        return $this->queryAllStamped($this->entityManager, $this->apiRequestParsingManager, $sql, [], []);
    }

    /**
     * Best scores the player has stored for each mini game on one interface.
     *
     * @throws Exception
     */
    public function getPlayerMiniGameProgress(string $player_id, string $interface_name): Response
    {
        $query = '
            SELECT
              mgp.game_name,
              mgp.score,
              mgp.updated_at
            FROM mini_game_progress mgp
            WHERE mgp.player_id = :player_id
            AND mgp.interface_name = :interface_name
            ORDER BY mgp.game_name
        ';

        $requestParams = [
            ApiParameters::PLAYER_ID => $player_id,
            ApiParameters::INTERFACE_NAME => $interface_name,
        ];
        $requiredFields = [ApiParameters::PLAYER_ID, ApiParameters::INTERFACE_NAME];

        return $this->queryAll(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $query,
            $requestParams,
            $requiredFields
        );
    }

    /**
     * Records a mini game score for the logged-in player, keeping the best one.
     * updated_at only moves when the score improves, so it dates the best score.
     * The player is always the session's, never one named in the body.
     *
     * @throws Exception
     */
    public function setPlayerMiniGameProgress(Request $request, Security $security): Response
    {
        /** @var Player $player */
        $player = $security->getUser();
        $player_id = $player->getId();

        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest(
            $request,
            [
                ApiParameters::INTERFACE_NAME,
                ApiParameters::GAME_NAME,
                ApiParameters::SCORE,
            ]
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $query = '
            INSERT INTO mini_game_progress (player_id, interface_name, game_name, score)
            VALUES (:player_id, :interface_name, :game_name, :score)
            ON CONFLICT (player_id, interface_name, game_name) DO UPDATE
            SET score = GREATEST(mini_game_progress.score, EXCLUDED.score),
                updated_at = CASE
                    WHEN EXCLUDED.score > mini_game_progress.score THEN now()
                    ELSE mini_game_progress.updated_at
                END
            RETURNING interface_name, game_name, score, created_at, updated_at
        ';

        $db = $this->entityManager->getConnection();
        $row = $db->fetchAssociative($query, [
            'player_id' => $player_id,
            'interface_name' => $parsedRequest->params->interface_name,
            'game_name' => $parsedRequest->params->game_name,
            'score' => $parsedRequest->params->score,
        ]);

        $responseContent->data = $row === false ? null : $row;
        $responseContent->success = $row !== false;

        return new JsonResponse(
            $responseContent,
            $responseContent->success ? Response::HTTP_OK : Response::HTTP_INTERNAL_SERVER_ERROR
        );
    }
}
