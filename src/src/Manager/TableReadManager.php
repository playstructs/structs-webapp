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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Paged / single-row reads for structs catalog tables (additive API).
 *
 * Conventions:
 *  - Every list query is paged via PaginationLimits::DEFAULT and gets a deterministic
 *    ORDER BY so LIMIT/OFFSET pagination is stable across repeat calls.
 *  - SELECT lists mirror the underlying table columns (1:1) without joining other
 *    tables; specialized read paths live on dedicated controllers/managers.
 *  - All bound params are validated by ApiRequestParsingManager via the trait.
 */
class TableReadManager
{
    use ApiSqlQueryTrait;

    /** Ordered by (updated_at, id): supports updated_since and the after_id cursor. */
    private const string KEYSET_UPDATED_AT_ID = 'updated_at_id';

    /** Has updated_at but no single-column id, so updated_since only, no cursor. */
    private const string FILTER_UPDATED_AT = 'updated_at';

    /**
     * Per-planet feed ordered by (time, seq). seq is a counter per planet, so it
     * only works as a cursor once the list is already filtered to one planet.
     * Supports since_seq only.
     */
    private const string KEYSET_SEQ = 'seq';

    private const string GRID_DEFAULT_ORDER = 'updated_at DESC NULLS LAST, id';

    public EntityManagerInterface $entityManager;

    public ValidatorInterface $validator;

    public ConstraintViolationUtil $constraintViolationUtil;

    public ApiRequestParsingManager $apiRequestParsingManager;

    private int $pageLimit = PaginationLimits::DEFAULT;

    private ?string $updatedSince = null;

    private ?string $isDestroyed = null;

    private bool $includeTotal = false;

    private bool $includeMeta = false;

    private ?string $order = null;

    private ?string $sinceSeq = null;

    private ?string $afterId = null;

    /** Set by the endpoints that consume order / is_destroyed, so the rest can reject them. */
    private bool $orderApplied = false;

    private bool $isDestroyedApplied = false;

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

    public function applyListQuery(Request $request): self
    {
        $this->pageLimit = PaginationLimits::clamp($request->query->get(ApiParameters::LIMIT));
        $updatedSince = $request->query->get(ApiParameters::UPDATED_SINCE);
        if ($updatedSince !== null && $updatedSince !== '') {
            $this->updatedSince = (string) $updatedSince;
        }
        $isDestroyed = $request->query->get(ApiParameters::IS_DESTROYED);
        if ($isDestroyed === '0' || $isDestroyed === '1') {
            $this->isDestroyed = $isDestroyed;
        }
        $this->includeTotal = $request->query->get(ApiParameters::INCLUDE_TOTAL) === '1';
        $this->includeMeta = $request->query->get(ApiParameters::INCLUDE_META) === '1';
        $order = $request->query->get(ApiParameters::ORDER);
        if ($order !== null && $order !== '') {
            $this->order = (string) $order;
        }
        $sinceSeq = $request->query->get(ApiParameters::SINCE_SEQ);
        if ($sinceSeq !== null && $sinceSeq !== '') {
            $this->sinceSeq = (string) $sinceSeq;
        }
        $afterId = $request->query->get(ApiParameters::AFTER_ID);
        if ($afterId !== null && $afterId !== '') {
            $this->afterId = (string) $afterId;
        }

        return $this;
    }

    /**
     * Composes a paged list response from its parts. Cursor and filter support is
     * declared per endpoint through $keyset rather than inferred from the finished
     * SQL, so a cursor param sent to an endpoint that cannot honour it is rejected
     * instead of being silently ignored.
     *
     * @param string[] $filters bare predicates, ANDed together
     * @param null|callable(array): array $rowMapper decorates each returned row
     * @throws Exception
     */
    private function listQuery(
        string $select,
        string $from,
        array $filters,
        string $orderBy,
        array $params,
        array $required,
        int $page,
        ?string $keyset = self::KEYSET_UPDATED_AT_ID,
        ?callable $rowMapper = null
    ): Response {
        $supportsUpdatedSince = $keyset === self::KEYSET_UPDATED_AT_ID
            || $keyset === self::FILTER_UPDATED_AT;

        if ($this->updatedSince !== null && !$supportsUpdatedSince) {
            return $this->unsupportedListParam(ApiParameters::UPDATED_SINCE);
        }
        if ($this->sinceSeq !== null && $keyset !== self::KEYSET_SEQ) {
            return $this->unsupportedListParam(ApiParameters::SINCE_SEQ);
        }
        if ($this->afterId !== null && $keyset !== self::KEYSET_UPDATED_AT_ID) {
            return $this->unsupportedListParam(ApiParameters::AFTER_ID);
        }
        if ($this->order !== null && !$this->orderApplied) {
            return $this->unsupportedListParam(ApiParameters::ORDER);
        }
        if ($this->isDestroyed !== null && !$this->isDestroyedApplied) {
            return $this->unsupportedListParam(ApiParameters::IS_DESTROYED);
        }

        if ($this->updatedSince !== null) {
            $filters[] = 'updated_at > to_timestamp(:updated_since)';
            $params[ApiParameters::UPDATED_SINCE] = $this->updatedSince;
            $required[] = ApiParameters::UPDATED_SINCE;
        }

        // A cursor replaces the offset; mixing the two would skip rows.
        $cursor = false;
        if ($keyset === self::KEYSET_SEQ && $this->sinceSeq !== null) {
            $filters[] = 'seq > :since_seq';
            $params[ApiParameters::SINCE_SEQ] = $this->sinceSeq;
            $required[] = ApiParameters::SINCE_SEQ;
            $cursor = true;
        } elseif ($this->afterId !== null) {
            // The page order is updated_at DESC NULLS LAST, id ASC, so the rows after
            // the cursor are the older ones, plus same-timestamp rows with a greater id.
            // NULL updated_at sorts last, which '-infinity' reproduces on both sides.
            $cursorTs = "(SELECT COALESCE(k.updated_at, '-infinity') FROM {$from} k WHERE k.id = :after_id)";
            $filters[] = "(COALESCE(updated_at, '-infinity') < {$cursorTs}"
                . " OR (COALESCE(updated_at, '-infinity') = {$cursorTs} AND id > :after_id))";
            $params[ApiParameters::AFTER_ID] = $this->afterId;
            $required[] = ApiParameters::AFTER_ID;
            $cursor = true;
        }

        $where = $filters === [] ? '' : 'WHERE ' . implode(' AND ', $filters);
        $offset = (max(1, $page) - 1) * $this->pageLimit;
        $paging = $cursor ? "LIMIT {$this->pageLimit}" : "LIMIT {$this->pageLimit} OFFSET {$offset}";

        $sql = "SELECT {$select}
            FROM {$from}
            {$where}
            ORDER BY {$orderBy}
            {$paging}";

        [$responseContent, $status] = $this->runQuery(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $sql,
            $params,
            $required,
            true
        );

        if ($status === Response::HTTP_OK && $rowMapper !== null && is_array($responseContent->data)) {
            $responseContent->data = array_map($rowMapper, $responseContent->data);
        }
        if ($status === Response::HTTP_OK && $this->includeTotal) {
            // runQuery already validated $params, so the bound values can be reused as-is.
            $responseContent->total = $this->entityManager->getConnection()->fetchOne(
                "SELECT count(*) FROM {$from} {$where}",
                array_intersect_key($params, array_flip($required))
            );
        }
        if ($status === Response::HTTP_OK && $this->includeMeta) {
            ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);
        }

        return new JsonResponse($responseContent, $status);
    }

    private function unsupportedListParam(string $param): Response
    {
        $responseContent = new ApiResponseContentDto();
        $responseContent->errors["{$param}_unsupported"] = "{$param} is not supported by this endpoint";

        return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
    }


    // --- address_tag ---

    public function addressTagAll(int $page): Response
    {
        return $this->listQuery(
            'address, label, entry, created_at, updated_at',
            'structs.address_tag',
            [],
            'updated_at DESC NULLS LAST, address, label',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function addressTagByAddress(string $address, int $page): Response
    {
        return $this->listQuery(
            'address, label, entry, created_at, updated_at',
            'structs.address_tag',
            [
                'address = :address',
            ],
            'updated_at DESC NULLS LAST, label',
            [ApiParameters::ADDRESS => $address, ApiParameters::PAGE => (string) $page],
            [ApiParameters::ADDRESS, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    // --- agreement ---

    public function agreementAll(int $page): Response
    {
        return $this->listQuery(
            'id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at',
            'structs.agreement',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function agreementByProvider(string $provider_id, int $page): Response
    {
        return $this->listQuery(
            'id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at',
            'structs.agreement',
            [
                'provider_id = :provider_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PROVIDER_ID => $provider_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PROVIDER_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function agreementByAllocation(string $allocation_id): Response
    {
        $sql = "SELECT id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at
            FROM structs.agreement
            WHERE allocation_id = :allocation_id
            LIMIT 1";
        $params = [ApiParameters::ALLOCATION_ID => $allocation_id];
        $required = [ApiParameters::ALLOCATION_ID];

        return $this->queryOne($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function agreementByCreator(string $creator): Response
    {
        $sql = "SELECT id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at
            FROM structs.agreement
            WHERE creator = :creator
            LIMIT 1";
        $params = [ApiParameters::CREATOR => $creator];
        $required = [ApiParameters::CREATOR];

        return $this->queryOne($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function agreementByOwner(string $owner): Response
    {
        $sql = "SELECT id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at
            FROM structs.agreement
            WHERE owner = :owner
            LIMIT 1";
        $params = [ApiParameters::OWNER => $owner];
        $required = [ApiParameters::OWNER];

        return $this->queryOne($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- allocation ---

    public function allocationAll(int $page): Response
    {
        return $this->listQuery(
            'id, allocation_type, source_id, index, destination_id, creator, controller, created_at, updated_at',
            'structs.allocation',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function allocationBySource(string $source_id, int $page): Response
    {
        return $this->listQuery(
            'id, allocation_type, source_id, index, destination_id, creator, controller, created_at, updated_at',
            'structs.allocation',
            [
                'source_id = :source_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::SOURCE_ID => $source_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::SOURCE_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function allocationByDestination(string $destination_id, int $page): Response
    {
        return $this->listQuery(
            'id, allocation_type, source_id, index, destination_id, creator, controller, created_at, updated_at',
            'structs.allocation',
            [
                'destination_id = :destination_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::DESTINATION_ID => $destination_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::DESTINATION_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function allocationByCreator(string $creator, int $page): Response
    {
        return $this->listQuery(
            'id, allocation_type, source_id, index, destination_id, creator, controller, created_at, updated_at',
            'structs.allocation',
            [
                'creator = :creator',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::CREATOR => $creator, ApiParameters::PAGE => (string) $page],
            [ApiParameters::CREATOR, ApiParameters::PAGE],
            $page,
        );
    }

    public function allocationByController(string $controller, int $page): Response
    {
        return $this->listQuery(
            'id, allocation_type, source_id, index, destination_id, creator, controller, created_at, updated_at',
            'structs.allocation',
            [
                'controller = :controller',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::CONTROLLER => $controller, ApiParameters::PAGE => (string) $page],
            [ApiParameters::CONTROLLER, ApiParameters::PAGE],
            $page,
        );
    }

    // --- banned_word ---

    public function bannedWordAll(): Response
    {
        $sql = "SELECT value, created_at, updated_at
            FROM structs.banned_word
            ORDER BY value";

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, [], []);
    }

    // --- defusion ---

    public function defusionAll(int $page): Response
    {
        return $this->listQuery(
            'validator_address, delegator_address, defusion_type, amount_p, amount, denom, completed_at, created_at',
            'structs.defusion',
            [],
            'created_at DESC NULLS LAST, validator_address, delegator_address',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            null,
        );
    }

    public function defusionByValidator(string $validator_address, int $page): Response
    {
        return $this->listQuery(
            'validator_address, delegator_address, defusion_type, amount_p, amount, denom, completed_at, created_at',
            'structs.defusion',
            [
                'validator_address = :validator_address',
            ],
            'created_at DESC NULLS LAST, delegator_address',
            [ApiParameters::VALIDATOR_ADDRESS => $validator_address, ApiParameters::PAGE => (string) $page],
            [ApiParameters::VALIDATOR_ADDRESS, ApiParameters::PAGE],
            $page,
            null,
        );
    }

    public function defusionByDelegator(string $delegator_address, int $page): Response
    {
        return $this->listQuery(
            'validator_address, delegator_address, defusion_type, amount_p, amount, denom, completed_at, created_at',
            'structs.defusion',
            [
                'delegator_address = :delegator_address',
            ],
            'created_at DESC NULLS LAST, validator_address',
            [ApiParameters::DELEGATOR_ADDRESS => $delegator_address, ApiParameters::PAGE => (string) $page],
            [ApiParameters::DELEGATOR_ADDRESS, ApiParameters::PAGE],
            $page,
            null,
        );
    }

    // --- fleet ---

    public function fleetAll(int $page): Response
    {
        return $this->listQuery(
            'id, owner, map, space_slots, air_slots, land_slots, water_slots, location_type, location_id, status, location_list_forward, location_list_backward, command_struct, created_at, updated_at',
            'structs.fleet',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function fleetByLocation(string $location_id, int $page): Response
    {
        return $this->listQuery(
            'id, owner, map, space_slots, air_slots, land_slots, water_slots, location_type, location_id, status, location_list_forward, location_list_backward, command_struct, created_at, updated_at',
            'structs.fleet',
            [
                'location_id = :location_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::LOCATION_ID => $location_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::LOCATION_ID, ApiParameters::PAGE],
            $page,
        );
    }

    // --- grid ---

    public function gridAll(int $page): Response
    {
        return $this->listQuery(
            'id, attribute_type, object_type, object_index, object_id, val, updated_at',
            'structs.grid',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function gridByObject(string $object_id, int $page): Response
    {
        return $this->listQuery(
            'id, attribute_type, object_type, object_index, object_id, val, updated_at',
            'structs.grid',
            [
                'object_id = :object_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OBJECT_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function gridByAttributeType(string $attribute_type, int $page): Response
    {
        return $this->gridByAttributeTypeFiltered($attribute_type, $page, null);
    }

    public function gridByAttributeTypeAndObjectType(string $attribute_type, string $object_type, int $page): Response
    {
        return $this->gridByAttributeTypeFiltered($attribute_type, $page, $object_type);
    }

    private function gridByAttributeTypeFiltered(string $attribute_type, int $page, ?string $object_type): Response
    {
        $filters = ['attribute_type = :attribute_type'];
        $params = [ApiParameters::ATTRIBUTE_TYPE => $attribute_type, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ATTRIBUTE_TYPE, ApiParameters::PAGE];
        if ($object_type !== null) {
            // grid.object_type is plain varchar, not the structs.object_type enum.
            $filters[] = 'object_type = :object_type';
            $params[ApiParameters::OBJECT_TYPE] = $object_type;
            $required[] = ApiParameters::OBJECT_TYPE;
        }

        $orderSql = $this->gridOrderSql();
        if ($orderSql === null) {
            $responseContent = new ApiResponseContentDto();
            $responseContent->errors['order_invalid'] = 'order is not allowlisted for grid reads';

            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        // The after_id cursor is a (updated_at, id) tuple, so it only holds while the
        // caller is on the default ordering.
        $keyset = $orderSql === self::GRID_DEFAULT_ORDER
            ? self::KEYSET_UPDATED_AT_ID
            : self::FILTER_UPDATED_AT;

        return $this->listQuery(
            'id, attribute_type, object_type, object_index, object_id, val, updated_at',
            'structs.grid',
            $filters,
            $orderSql,
            $params,
            $required,
            $page,
            $keyset,
        );
    }

    // --- guild (list routes only; single guild still on GuildController) ---

    public function guildAll(int $page): Response
    {
        return $this->listQuery(
            'id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request, join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, entry_rank, creator, owner, created_at, updated_at',
            'structs.guild',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function guildByPrimaryReactor(string $primary_reactor_id, int $page): Response
    {
        return $this->listQuery(
            'id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request, join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, entry_rank, creator, owner, created_at, updated_at',
            'structs.guild',
            [
                'primary_reactor_id = :primary_reactor_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PRIMARY_REACTOR_ID => $primary_reactor_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PRIMARY_REACTOR_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function guildByEntrySubstation(string $entry_substation_id, int $page): Response
    {
        return $this->listQuery(
            'id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request, join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, entry_rank, creator, owner, created_at, updated_at',
            'structs.guild',
            [
                'entry_substation_id = :entry_substation_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::ENTRY_SUBSTATION_ID => $entry_substation_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::ENTRY_SUBSTATION_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function guildByOwner(string $owner, int $page): Response
    {
        return $this->listQuery(
            'id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request, join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, entry_rank, creator, owner, created_at, updated_at',
            'structs.guild',
            [
                'owner = :owner',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OWNER, ApiParameters::PAGE],
            $page,
        );
    }

    public function guildMembershipApplicationAll(int $page): Response
    {
        return $this->listQuery(
            'guild_id, player_id, join_type, status, proposer, substation_id, created_at, updated_at',
            'structs.guild_membership_application',
            [],
            'updated_at DESC NULLS LAST, guild_id, player_id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function guildMembershipApplicationByGuild(string $guild_id, int $page): Response
    {
        return $this->listQuery(
            'guild_id, player_id, join_type, status, proposer, substation_id, created_at, updated_at',
            'structs.guild_membership_application',
            [
                'guild_id = :guild_id',
            ],
            'updated_at DESC NULLS LAST, player_id',
            [ApiParameters::GUILD_ID => $guild_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::GUILD_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function guildMembershipApplicationByPlayer(string $player_id, int $page): Response
    {
        return $this->listQuery(
            'guild_id, player_id, join_type, status, proposer, substation_id, created_at, updated_at',
            'structs.guild_membership_application',
            [
                'player_id = :player_id',
            ],
            'updated_at DESC NULLS LAST, guild_id',
            [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PLAYER_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    // --- infusion (raw rows; distinct from InfusionController guild join) ---

    public function infusionAll(int $page): Response
    {
        return $this->listQuery(
            'destination_id, address, destination_type, player_id, fuel, fuel_p, defusing, defusing_p, power, power_p, ratio, ratio_p, commission, created_at, updated_at',
            'structs.infusion',
            [],
            'updated_at DESC NULLS LAST, destination_id, address',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function infusionByDestination(string $destination_id, int $page): Response
    {
        return $this->listQuery(
            'destination_id, address, destination_type, player_id, fuel, fuel_p, defusing, defusing_p, power, power_p, ratio, ratio_p, commission, created_at, updated_at',
            'structs.infusion',
            [
                'destination_id = :destination_id',
            ],
            'updated_at DESC NULLS LAST, address',
            [ApiParameters::DESTINATION_ID => $destination_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::DESTINATION_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function infusionByAddress(string $address, int $page): Response
    {
        return $this->listQuery(
            'destination_id, address, destination_type, player_id, fuel, fuel_p, defusing, defusing_p, power, power_p, ratio, ratio_p, commission, created_at, updated_at',
            'structs.infusion',
            [
                'address = :address',
            ],
            'updated_at DESC NULLS LAST, destination_id',
            [ApiParameters::ADDRESS => $address, ApiParameters::PAGE => (string) $page],
            [ApiParameters::ADDRESS, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function infusionByPlayerList(string $player_id, int $page): Response
    {
        return $this->listQuery(
            'destination_id, address, destination_type, player_id, fuel, fuel_p, defusing, defusing_p, power, power_p, ratio, ratio_p, commission, created_at, updated_at',
            'structs.infusion',
            [
                'player_id = :player_id',
            ],
            'updated_at DESC NULLS LAST, destination_id, address',
            [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PLAYER_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    // --- ledger (under /api/ledger/list/... to avoid tx_id collision) ---

    public function ledgerListAll(int $page): Response
    {
        return $this->listQuery(
            'time, id, address, counterparty, amount, amount_p, block_height, action::text AS action, direction::text AS direction, denom',
            'structs.ledger',
            [],
            'time DESC, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            null,
        );
    }

    public function ledgerListByPlayer(string $player_id, int $page): Response
    {
        return $this->listQuery(
            'l.time, l.id, l.address, l.counterparty, l.amount, l.amount_p, l.block_height, l.action::text AS action, l.direction::text AS direction, l.denom',
            'structs.ledger l INNER JOIN structs.player_address pa ON pa.address = l.address AND pa.player_id = :player_id',
            [],
            'l.time DESC, l.id',
            [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PLAYER_ID, ApiParameters::PAGE],
            $page,
            null,
        );
    }

    public function ledgerListByAddress(string $address, int $page): Response
    {
        return $this->listQuery(
            'time, id, address, counterparty, amount, amount_p, block_height, action::text AS action, direction::text AS direction, denom',
            'structs.ledger',
            [
                'address = :address',
            ],
            'time DESC, id',
            [ApiParameters::ADDRESS => $address, ApiParameters::PAGE => (string) $page],
            [ApiParameters::ADDRESS, ApiParameters::PAGE],
            $page,
            null,
        );
    }

    // --- permission ---

    public function permissionAll(int $page): Response
    {
        return $this->listQuery(
            'id, object_type, object_index, object_id, player_id, val, updated_at',
            'structs.permission',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function permissionByObject(string $object_id, int $page): Response
    {
        return $this->listQuery(
            'id, object_type, object_index, object_id, player_id, val, updated_at',
            'structs.permission',
            [
                'object_id = :object_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OBJECT_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function permissionByPlayer(string $player_id, int $page): Response
    {
        return $this->listQuery(
            'id, object_type, object_index, object_id, player_id, val, updated_at',
            'structs.permission',
            [
                'player_id = :player_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PLAYER_ID, ApiParameters::PAGE],
            $page,
        );
    }

    // --- permission_guild_rank ---

    public function permissionGuildRankAll(int $page): Response
    {
        return $this->listQuery(
            'object_id, guild_id, permission, rank, updated_at',
            'structs.permission_guild_rank',
            [],
            'updated_at DESC NULLS LAST, object_id, guild_id, permission',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function permissionGuildRankByObject(string $object_id, int $page): Response
    {
        return $this->listQuery(
            'object_id, guild_id, permission, rank, updated_at',
            'structs.permission_guild_rank',
            [
                'object_id = :object_id',
            ],
            'updated_at DESC NULLS LAST, guild_id, permission',
            [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OBJECT_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function permissionGuildRankByGuild(string $guild_id, int $page): Response
    {
        return $this->listQuery(
            'object_id, guild_id, permission, rank, updated_at',
            'structs.permission_guild_rank',
            [
                'guild_id = :guild_id',
            ],
            'updated_at DESC NULLS LAST, object_id, permission',
            [ApiParameters::GUILD_ID => $guild_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::GUILD_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    // --- planet ---

    public function planetListAll(int $page): Response
    {
        return $this->listQuery(
            'id, max_ore, creator, owner, map, space_slots, air_slots, land_slots, water_slots, status, location_list_start, location_list_end, created_at, updated_at',
            'structs.planet',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function planetListByOwner(string $owner, int $page): Response
    {
        return $this->listQuery(
            'id, max_ore, creator, owner, map, space_slots, air_slots, land_slots, water_slots, status, location_list_start, location_list_end, created_at, updated_at',
            'structs.planet',
            [
                'owner = :owner',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OWNER, ApiParameters::PAGE],
            $page,
        );
    }

    // --- planet_activity (hypertable; ordered by time DESC) ---

    public function planetActivityAll(int $page): Response
    {
        return $this->planetActivityPage($page, null, null);
    }

    public function planetActivityByPlanet(string $planet_id, int $page): Response
    {
        return $this->planetActivityPage($page, $planet_id, null);
    }

    public function planetActivityByCategory(string $category, int $page): Response
    {
        return $this->planetActivityPage($page, null, $category);
    }

    /**
     * @throws Exception
     */
    public function planetActivityStats(?string $category, ?string $bucket): Response
    {
        $responseContent = new ApiResponseContentDto();
        $params = [ApiParameters::CATEGORY => $category, ApiParameters::BUCKET => $bucket];
        $required = [];
        $optional = [ApiParameters::CATEGORY, ApiParameters::BUCKET];
        $parsedRequest = $this->apiRequestParsingManager->parse($params, $required, $optional);
        $responseContent->errors = $parsedRequest->errors;
        if (count($responseContent->errors) > 0) {
            return new JsonResponse($responseContent, Response::HTTP_BAD_REQUEST);
        }

        $trunc = ($bucket === '1h') ? 'hour' : 'day';
        $categorySql = '';
        $queryParams = [];
        if ($category !== null && $category !== '') {
            $categorySql = 'AND category = CAST(:category AS structs.grass_category)';
            $queryParams['category'] = $category;
        }

        $sql = "SELECT date_trunc('{$trunc}', time) AS bucket,
                category::text AS category,
                count(*) AS count
            FROM structs.planet_activity
            WHERE time >= NOW() - INTERVAL '30 days'
            {$categorySql}
            GROUP BY bucket, category
            ORDER BY bucket, category";

        $db = $this->entityManager->getConnection();
        $responseContent->data = $db->fetchAllAssociative($sql, $queryParams);
        $responseContent->success = true;
        ResponseMetaUtil::stampHeight($responseContent, $this->entityManager);

        return new JsonResponse($responseContent, Response::HTTP_OK);
    }

    private function planetActivityPage(int $page, ?string $planet_id, ?string $category): Response
    {
        $filters = [];
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];
        if ($planet_id !== null) {
            $filters[] = 'planet_id = :planet_id';
            $params[ApiParameters::PLANET_ID] = $planet_id;
            $required[] = ApiParameters::PLANET_ID;
        }
        if ($category !== null) {
            $filters[] = 'category = CAST(:category AS structs.grass_category)';
            $params[ApiParameters::CATEGORY] = $category;
            $required[] = ApiParameters::CATEGORY;
        }

        return $this->listQuery(
            'time, seq, planet_id, category::text AS category, detail',
            'structs.planet_activity',
            $filters,
            'time DESC, seq DESC',
            $params,
            $required,
            $page,
            $planet_id === null ? null : self::KEYSET_SEQ,
            static function (array $row): array {
                $decoded = json_decode((string) ($row['detail'] ?? ''), true);
                $row['detail_json'] = is_array($decoded) ? $decoded : null;

                return $row;
            },
        );
    }

    // --- player ---

    public function playerListAll(int $page): Response
    {
        return $this->listQuery(
            'id, index, creator, primary_address, guild_id, guild_rank, substation_id, planet_id, fleet_id, created_at, updated_at',
            'structs.player',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function playerListByGuild(string $guild_id, int $page): Response
    {
        return $this->listQuery(
            'id, index, creator, primary_address, guild_id, guild_rank, substation_id, planet_id, fleet_id, created_at, updated_at',
            'structs.player',
            [
                'guild_id = :guild_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::GUILD_ID => $guild_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::GUILD_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function playerListBySubstation(string $substation_id, int $page): Response
    {
        return $this->listQuery(
            'id, index, creator, primary_address, guild_id, guild_rank, substation_id, planet_id, fleet_id, created_at, updated_at',
            'structs.player',
            [
                'substation_id = :substation_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::SUBSTATION_ID => $substation_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::SUBSTATION_ID, ApiParameters::PAGE],
            $page,
        );
    }

    // --- provider ---

    public function providerAll(int $page): Response
    {
        return $this->listQuery(
            'id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum, duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty, creator, owner, created_at, updated_at',
            'structs.provider',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function providerByOwner(string $owner, int $page): Response
    {
        return $this->listQuery(
            'id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum, duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty, creator, owner, created_at, updated_at',
            'structs.provider',
            [
                'owner = :owner',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OWNER, ApiParameters::PAGE],
            $page,
        );
    }

    public function providerByDenom(string $denom, int $page): Response
    {
        return $this->listQuery(
            'id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum, duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty, creator, owner, created_at, updated_at',
            'structs.provider',
            [
                'rate_denom = :denom',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::DENOM => $denom, ApiParameters::PAGE => (string) $page],
            [ApiParameters::DENOM, ApiParameters::PAGE],
            $page,
        );
    }

    public function providerBySubstation(string $substation_id, int $page): Response
    {
        return $this->listQuery(
            'id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum, duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty, creator, owner, created_at, updated_at',
            'structs.provider',
            [
                'substation_id = :substation_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::SUBSTATION_ID => $substation_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::SUBSTATION_ID, ApiParameters::PAGE],
            $page,
        );
    }

    // --- reactor ---

    public function reactorAll(int $page): Response
    {
        return $this->listQuery(
            'id, validator, guild_id, default_commission, owner, created_at, updated_at',
            'structs.reactor',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function reactorByValidator(string $validator_address, int $page): Response
    {
        return $this->listQuery(
            'id, validator, guild_id, default_commission, owner, created_at, updated_at',
            'structs.reactor',
            [
                'validator = :validator_address',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::VALIDATOR_ADDRESS => $validator_address, ApiParameters::PAGE => (string) $page],
            [ApiParameters::VALIDATOR_ADDRESS, ApiParameters::PAGE],
            $page,
        );
    }

    public function reactorByGuild(string $guild_id, int $page): Response
    {
        return $this->listQuery(
            'id, validator, guild_id, default_commission, owner, created_at, updated_at',
            'structs.reactor',
            [
                'guild_id = :guild_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::GUILD_ID => $guild_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::GUILD_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function reactorByOwner(string $owner, int $page): Response
    {
        return $this->listQuery(
            'id, validator, guild_id, default_commission, owner, created_at, updated_at',
            'structs.reactor',
            [
                'owner = :owner',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OWNER, ApiParameters::PAGE],
            $page,
        );
    }

    // --- substation ---

    public function substationAll(int $page): Response
    {
        return $this->listQuery(
            'id, owner, creator, name, pfp, created_at, updated_at',
            'structs.substation',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function substationByOwner(string $owner, int $page): Response
    {
        return $this->listQuery(
            'id, owner, creator, name, pfp, created_at, updated_at',
            'structs.substation',
            [
                'owner = :owner',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OWNER, ApiParameters::PAGE],
            $page,
        );
    }

    // --- struct ---

    public function structListAll(int $page): Response
    {
        return $this->structList($page, null, null);
    }

    public function structListByOwner(string $owner, int $page): Response
    {
        return $this->structList($page, $owner, null);
    }

    public function structListByLocation(string $location_id, int $page): Response
    {
        return $this->structList($page, null, $location_id);
    }

    private function structList(int $page, ?string $owner, ?string $location_id): Response
    {
        $filters = [];
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];
        if ($owner !== null) {
            $filters[] = 'owner = :owner';
            $params[ApiParameters::OWNER] = $owner;
            $required[] = ApiParameters::OWNER;
        }
        if ($location_id !== null) {
            $filters[] = 'location_id = :location_id';
            $params[ApiParameters::LOCATION_ID] = $location_id;
            $required[] = ApiParameters::LOCATION_ID;
        }
        if ($this->isDestroyed !== null) {
            $this->isDestroyedApplied = true;
            $filters[] = "is_destroyed = (:is_destroyed = '1')";
            $params[ApiParameters::IS_DESTROYED] = $this->isDestroyed;
            $required[] = ApiParameters::IS_DESTROYED;
        }

        return $this->listQuery(
            'id, index, type, creator, owner, location_type, location_id, operating_ambit, slot, is_destroyed, destroyed_block, created_at, updated_at',
            'structs.struct',
            $filters,
            'updated_at DESC NULLS LAST, id',
            $params,
            $required,
            $page,
        );
    }

    // --- struct_attribute ---

    public function structAttributeAll(int $page): Response
    {
        return $this->listQuery(
            'id, object_id, object_type, sub_index, attribute_type, val, updated_at',
            'structs.struct_attribute',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function structAttributeByObject(string $object_id, int $page): Response
    {
        return $this->listQuery(
            'id, object_id, object_type, sub_index, attribute_type, val, updated_at',
            'structs.struct_attribute',
            [
                'object_id = :object_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OBJECT_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function structAttributeByType(string $attribute_type, int $page): Response
    {
        return $this->listQuery(
            'id, object_id, object_type, sub_index, attribute_type, val, updated_at',
            'structs.struct_attribute',
            [
                'attribute_type = :attribute_type',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::ATTRIBUTE_TYPE => $attribute_type, ApiParameters::PAGE => (string) $page],
            [ApiParameters::ATTRIBUTE_TYPE, ApiParameters::PAGE],
            $page,
        );
    }

    // --- struct_defender ---

    public function structDefenderAll(int $page): Response
    {
        return $this->listQuery(
            'defending_struct_id, protected_struct_id, updated_at',
            'structs.struct_defender',
            [],
            'updated_at DESC NULLS LAST, defending_struct_id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    public function structDefenderByDefending(string $defending_struct_id): Response
    {
        $sql = "SELECT defending_struct_id, protected_struct_id, updated_at
            FROM structs.struct_defender
            WHERE defending_struct_id = :defending_struct_id
            LIMIT 1";
        $params = [ApiParameters::DEFENDING_STRUCT_ID => $defending_struct_id];
        $required = [ApiParameters::DEFENDING_STRUCT_ID];

        return $this->queryOne($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function structDefenderByProtected(string $protected_struct_id, int $page): Response
    {
        return $this->listQuery(
            'defending_struct_id, protected_struct_id, updated_at',
            'structs.struct_defender',
            [
                'protected_struct_id = :protected_struct_id',
            ],
            'updated_at DESC NULLS LAST, defending_struct_id',
            [ApiParameters::PROTECTED_STRUCT_ID => $protected_struct_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::PROTECTED_STRUCT_ID, ApiParameters::PAGE],
            $page,
            self::FILTER_UPDATED_AT,
        );
    }

    // --- planet_attribute ---

    public function planetAttributeAll(int $page): Response
    {
        return $this->listQuery(
            'id, object_id, object_type, attribute_type, val, updated_at',
            'structs.planet_attribute',
            [],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::PAGE => (string) $page],
            [ApiParameters::PAGE],
            $page,
        );
    }

    public function planetAttributeByObject(string $object_id, int $page): Response
    {
        return $this->listQuery(
            'id, object_id, object_type, attribute_type, val, updated_at',
            'structs.planet_attribute',
            [
                'object_id = :object_id',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page],
            [ApiParameters::OBJECT_ID, ApiParameters::PAGE],
            $page,
        );
    }

    public function planetAttributeByType(string $attribute_type, int $page): Response
    {
        return $this->listQuery(
            'id, object_id, object_type, attribute_type, val, updated_at',
            'structs.planet_attribute',
            [
                'attribute_type = :attribute_type',
            ],
            'updated_at DESC NULLS LAST, id',
            [ApiParameters::ATTRIBUTE_TYPE => $attribute_type, ApiParameters::PAGE => (string) $page],
            [ApiParameters::ATTRIBUTE_TYPE, ApiParameters::PAGE],
            $page,
        );
    }

    /**
     * @throws Exception
     */
    public function countFleets(): Response
    {
        return $this->queryOne($this->entityManager, $this->apiRequestParsingManager, 'SELECT count(*) AS count FROM structs.fleet', [], []);
    }

    /**
     * @throws Exception
     */
    public function providerMarket(): Response
    {
        $sql = "SELECT
              p.id,
              p.owner,
              p.substation_id,
              p.rate_amount,
              p.rate_denom,
              p.access_policy,
              p.capacity_minimum,
              p.capacity_maximum,
              p.duration_minimum,
              p.duration_maximum,
              p.provider_cancellation_penalty,
              p.consumer_cancellation_penalty,
              s.owner AS substation_owner,
              gm.id AS guild_id,
              CASE
                WHEN p.rate_denom IN ('ualpha', 'alpha') THEN p.rate_amount
                ELSE floor(p.rate_amount * COALESCE(gb.ratio, 0))
              END AS alpha_equivalent_rate_p,
              COALESCE(c.committed_capacity, 0) AS committed_capacity
            FROM structs.provider p
            LEFT JOIN structs.substation s ON s.id = p.substation_id
            LEFT JOIN structs.player pl ON pl.id = p.owner
            LEFT JOIN structs.guild_meta gm ON gm.id = pl.guild_id
            LEFT JOIN structs.api_guild_bank gb
              ON gb.guild_id = pl.guild_id
              AND gb.denom = p.rate_denom
            LEFT JOIN (
              SELECT provider_id, SUM(capacity) AS committed_capacity
              FROM structs.agreement
              WHERE end_block IS NULL OR end_block > (SELECT height FROM current_block LIMIT 1)
              GROUP BY provider_id
            ) c ON c.provider_id = p.id
            ORDER BY p.id";

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
    public function agreementByOwnerMarket(string $owner): Response
    {
        $sql = "SELECT
              a.id,
              a.provider_id,
              a.allocation_id,
              a.capacity,
              a.start_block,
              a.end_block,
              a.creator,
              a.owner,
              a.created_at,
              a.updated_at,
              GREATEST(a.end_block - (SELECT height FROM current_block LIMIT 1), 0) AS blocks_remaining,
              (a.capacity * COALESCE(p.rate_amount, 0) * GREATEST(a.end_block - (SELECT height FROM current_block LIMIT 1), 0))::text AS escrow_remaining
            FROM structs.agreement a
            LEFT JOIN structs.provider p ON p.id = a.provider_id
            WHERE a.owner = :owner
            ORDER BY a.end_block DESC NULLS LAST, a.id";
        $params = [ApiParameters::OWNER => $owner];
        $required = [ApiParameters::OWNER];

        return $this->queryAllStamped(
            $this->entityManager,
            $this->apiRequestParsingManager,
            $sql,
            $params,
            $required
        );
    }

    private function gridOrderSql(): ?string
    {
        $allow = [
            'val.desc' => 'val DESC, id',
            'val.asc' => 'val ASC, id',
            'updated_at.desc' => 'updated_at DESC NULLS LAST, id',
            'updated_at.asc' => 'updated_at ASC NULLS LAST, id',
            'id.desc' => 'id DESC',
            'id.asc' => 'id ASC',
            'object_id.desc' => 'object_id DESC',
            'object_id.asc' => 'object_id ASC',
        ];
        if ($this->order === null) {
            return self::GRID_DEFAULT_ORDER;
        }
        $this->orderApplied = true;

        return $allow[$this->order] ?? null;
    }
}
