<?php

namespace App\Manager;

use App\Constant\ApiParameters;
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
        ];
        $apiRequiredParams = [];
        $apiOptionalParams = [
            ApiParameters::GUILD_ID,
            ApiParameters::MIN_ORE,
            ApiParameters::SEARCH_STRING,
            ApiParameters::FLEET_AWAY_ONLY
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

        $queryParams = ['min_ore' => $parsedRequest->params->min_ore ?? 0];

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
            $queryParams['search_string'] = "%{$parsedRequest->params->search_string}%";
            $querySearchFilter = "
                AND (
                    p.id LIKE :search_string
                    OR pm.username LIKE :search_string
                    OR pa.address LIKE :search_string
                )
            ";
        }

        $query = "
            SELECT
              p.id,
              pm.username,
              pm.pfp,
              gm.name AS guild_name,
              gm.tag,
              f.status,
              COALESCE(planet_ore.val, 0) AS undiscovered_ore,
              COALESCE(player_ore.val, 0) AS ore
            FROM player p
            INNER JOIN player_address pa
              ON p.id = pa.player_id
            INNER JOIN fleet f
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
              player_ore.val >= :min_ore
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
    public function getInfusionByPlayerId(string $player_id): Response
    {
        $query = '
            SELECT
              i.destination_id,
              i.address,
              i.destination_type,
              i.player_id,
              COALESCE(i.fuel, 0) AS fuel,
              COALESCE(i.defusing, 0) AS defusing,
              COALESCE(i.power, 0) AS power,
              COALESCE(i.ratio, 0) AS ratio
              COALESCE(i.commission, 0) AS commission,
              i.created_at,
              i.updated_at,
              g.join_infusion_minimum
            FROM player p
            INNER JOIN guild g
              ON p.guild_id = g.id
            LEFT JOIN infusion i
              ON g.primary_reactor_id = i.destination_id
              AND p.id = i.player_id 
            WHERE p.id = :player_id;
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
}