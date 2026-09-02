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

class LeaderboardManager
{
    use ApiSqlQueryTrait;

    /**
     * The api_leaderboard_* tables hold base denominations under bare column
     * names, so each select renames amounts to their _p form on the way out
     * rather than shipping an ambiguous `alpha_balance` that is actually ualpha.
     *
     * @var array<string, array{table: string, model: string, select: string, default_order: string, orders: array<string, string>}>
     */
    private const KINDS = [
        'player' => [
            'table' => 'structs.api_leaderboard_player',
            'model' => 'leaderboard_player',
            'select' => 'player_id, username, guild_id,
                alpha_balance::text AS alpha_balance_p,
                alpha_value::text AS alpha_value_p',
            'default_order' => 'alpha_value DESC NULLS LAST, player_id',
            'orders' => [
                'alpha_value.desc' => 'alpha_value DESC NULLS LAST, player_id',
                'alpha_value.asc' => 'alpha_value ASC NULLS LAST, player_id',
                'alpha_balance.desc' => 'alpha_balance DESC, player_id',
                'alpha_balance.asc' => 'alpha_balance ASC, player_id',
            ],
        ],
        'guild' => [
            'table' => 'structs.api_leaderboard_guild',
            'model' => 'leaderboard_guild',
            'select' => 'guild_id, name, onchain_name, player_count,
                collateral::text AS collateral_p,
                supply::text AS supply_p,
                ratio,
                member_capacity::text AS member_capacity_p,
                member_load::text AS member_load_p,
                shared_connection_capacity::text AS shared_connection_capacity_p',
            'default_order' => 'collateral DESC NULLS LAST, guild_id',
            'orders' => [
                'collateral.desc' => 'collateral DESC NULLS LAST, guild_id',
                'ratio.desc' => 'ratio DESC NULLS LAST, guild_id',
                'player_count.desc' => 'player_count DESC, guild_id',
            ],
        ],
        'reactor' => [
            'table' => 'structs.api_leaderboard_reactor',
            'model' => 'leaderboard_reactor',
            'select' => 'reactor_id, fuel::text AS fuel_p, power::text AS power_p',
            'default_order' => 'fuel DESC, reactor_id',
            'orders' => [
                'fuel.desc' => 'fuel DESC, reactor_id',
                'power.desc' => 'power DESC, reactor_id',
            ],
        ],
        'substation' => [
            'table' => 'structs.api_leaderboard_substation',
            'model' => 'leaderboard_substation',
            'select' => 'substation_id, owner,
                load::text AS load_p,
                member_capacity::text AS member_capacity_p,
                shared_connection_capacity::text AS shared_connection_capacity_p,
                player_count',
            'default_order' => 'load DESC, substation_id',
            'orders' => [
                'load.desc' => 'load DESC, substation_id',
                'member_capacity.desc' => 'member_capacity DESC, substation_id',
                'shared_connection_capacity.desc' => 'shared_connection_capacity DESC, substation_id',
                'player_count.desc' => 'player_count DESC, substation_id',
            ],
        ],
        'provider' => [
            'table' => 'structs.api_leaderboard_provider',
            'model' => 'leaderboard_provider',
            'select' => 'provider_id, owner, rate_amount::text AS rate_amount_p, rate_denom, agreement_count',
            'default_order' => 'agreement_count DESC, provider_id',
            'orders' => [
                'agreement_count.desc' => 'agreement_count DESC, provider_id',
                'rate_amount.desc' => 'rate_amount DESC NULLS LAST, provider_id',
            ],
        ],
    ];

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
    public function getLeaderboard(string $kind, ?string $order, ?string $limit): Response
    {
        $responseContent = new ApiResponseContentDto();
        $params = [
            ApiParameters::KIND => $kind,
            ApiParameters::ORDER => $order,
            ApiParameters::LIMIT => $limit,
        ];
        $required = [ApiParameters::KIND];
        $optional = [ApiParameters::ORDER, ApiParameters::LIMIT];

        $parsedRequest = $this->apiRequestParsingManager->parse($params, $required, $optional);
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $config = self::KINDS[$kind] ?? null;
        if ($config === null) {
            $responseContent->errors['kind_invalid'] = 'kind must be player, guild, reactor, substation, or provider';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $orderSql = $config['default_order'];
        if ($order !== null && $order !== '') {
            if (!isset($config['orders'][$order])) {
                $responseContent->errors['order_invalid'] = 'order is not allowlisted for this leaderboard';

                return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
            }
            $orderSql = $config['orders'][$order];
        }

        $pageLimit = PaginationLimits::clamp($limit, PaginationLimits::LEADERBOARD_DEFAULT);

        $sql = "SELECT {$config['select']}
            FROM {$config['table']} lb
            ORDER BY {$orderSql}
            LIMIT {$pageLimit}";

        $db = $this->entityManager->getConnection();
        $responseContent->data = $db->fetchAllAssociative($sql);
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager, $config['model']);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }
}
