<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Constant\RegexPattern;
use App\Dto\ApiResponseContentDto;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PlayerManager
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
    public function getPlayer(string $player_id): Response
    {
        $query = '
            SELECT
              p.id,
              p.primary_address,
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
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
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
            LEFT JOIN guild_meta gm
              ON p.guild_id = gm.id
            LEFT JOIN player_meta pm
              ON p.id = pm.id
              AND p.guild_id = pm.guild_id
            WHERE p.id = :player_id
            LIMIT 1;
        ';

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
            ApiParameters::COUNT_ONLY => $request->query->get(ApiParameters::COUNT_ONLY),
            ApiParameters::PAGE => $request->query->get(ApiParameters::PAGE),
        ];
        $apiRequiredParams = [];
        $apiOptionalParams = [
            ApiParameters::GUILD_ID,
            ApiParameters::MIN_ORE,
            ApiParameters::SEARCH_STRING,
            ApiParameters::FLEET_AWAY_ONLY,
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
            isset($parsedRequest->params->search_string)
            && $parsedRequest->params->search_string !== ''
        ) {
            $queryParams['search_string'] = $parsedRequest->params->search_string;
            $queryParams['like_search_string'] = "%{$parsedRequest->params->search_string}%";
            $querySearchFilter = "
                AND (
                    p.id = :search_string
                    OR pm.username ILIKE :like_search_string
                    OR pa.address = :search_string
                )
            ";
        }

        $query = "
            SELECT
              p.id,
              p.planet_id,
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
              gm.tag,
              f.status AS fleet_status,
              COALESCE(planet_ore.val, 0) AS undiscovered_ore,
              COALESCE(player_ore.val, 0) AS ore
            FROM player p
            INNER JOIN planet
              ON p.planet_id = planet.id
            LEFT JOIN player_address pa
              ON p.id = pa.player_id
            LEFT JOIN fleet f
              ON p.fleet_id = f.id
            LEFT JOIN player_meta pm
              ON p.id = pm.id
              AND p.guild_id = pm.guild_id
            LEFT JOIN guild_meta gm
              ON p.guild_id = gm.id
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
              $querySearchFilter
            GROUP BY
              p.id,
              pm.username,
              pm.pfp,
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
                    LEFT JOIN player_meta pm
                      ON p.id = pm.id
                      AND p.guild_id = pm.guild_id
                    LEFT JOIN guild_meta gm
                      ON p.guild_id = gm.id
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
    public function updateUsername(Request $request): Response
    {
        $responseContent = new ApiResponseContentDto();

        $parsedRequest = $this->apiRequestParsingManager->parseJsonRequest(
            $request,
            [
                ApiParameters::USERNAME
            ],
            [],
            true
        );

        $responseContent->errors = $parsedRequest->errors;

        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $session = $request->getSession();
        $player_id = $session->get('player_id');

        $query = '
            INSERT
            INTO player_meta(id, guild_id, username, created_at, updated_at)
            (
                SELECT
                    p.id,
                    p.guild_id,
                    :username AS "username",
                    NOW() AS "created_at",
                    NOW() AS "updated_at"
                FROM player p
                WHERE p.id = :player_id
                LIMIT 1
            )
            ON CONFLICT (id, guild_id) DO UPDATE
              SET 
                username = :username,
                updated_at = NOW();
        ';

        $db = $this->entityManager->getConnection();
        $rowsAffected = $db->executeStatement($query, [
            'player_id' => $player_id,
            'username' => $parsedRequest->params->username
        ]);

        $responseContent->data = ['rows_affected' => $rowsAffected];
        $responseContent->success = $rowsAffected === 1;
        $status = Response::HTTP_OK;

        if (!$responseContent->success) {
            $responseContent->errors = ['inconsistent_data' => 'Logged in player not found in DB.'];
            $status = Response::HTTP_INTERNAL_SERVER_ERROR;
        }

        return new JsonResponse($responseContent, $status);
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
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
              gm.tag,
              COALESCE(vpi.balance, 0) as alpha
            FROM player_address pa
            LEFT JOIN player p
              ON p.id = pa.player_id
            LEFT JOIN player_meta pm
              ON p.id = pm.id
              AND p.guild_id = pm.guild_id
            LEFT JOIN guild_meta gm
              ON p.guild_id = gm.id
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
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
              gm.tag,
              COALESCE(vpi.balance, 0) as alpha
            FROM player p
            LEFT JOIN player_meta pm
              ON p.id = pm.id
              AND p.guild_id = pm.guild_id
            LEFT JOIN guild_meta gm
              ON p.guild_id = gm.id
            LEFT JOIN view.player_inventory vpi
              ON p.id = vpi.player_id
              AND vpi.denom = 'alpha'
            WHERE p.id ILIKE :like_search_string
              OR pm.username ILIKE :like_search_string
              $queryGuildIdFilter
            LIMIT 25;
        ";

        $db = $this->entityManager->getConnection();
        $result = $db->fetchAllAssociative($query, $queryParams);

        $responseContent->data = $result;
        $responseContent->success = true;

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
            INNER JOIN planet p
                ON pa.planet_id = p.id
            WHERE pa.category = 'fleet_depart'
            AND p.owner = :player_id
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
}