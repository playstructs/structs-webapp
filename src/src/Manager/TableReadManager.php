<?php

namespace App\Manager;

use App\Constant\ApiParameters;
use App\Constant\PaginationLimits;
use App\Trait\ApiSqlQueryTrait;
use App\Util\ConstraintViolationUtil;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Paged / single-row reads for structs catalog tables (additive API).
 */
class TableReadManager
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
     * @return array{0: int, 1: int}
     */
    private function limitOffset(int $page): array
    {
        $limit = PaginationLimits::DEFAULT;
        $page = max(1, $page);
        $offset = ($page - 1) * $limit;

        return [$limit, $offset];
    }

    // --- address_tag ---

    public function addressTagAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT address, label, entry, created_at, updated_at
            FROM structs.address_tag
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function addressTagByAddress(string $address, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT address, label, entry, created_at, updated_at
            FROM structs.address_tag
            WHERE address = :address
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ADDRESS => $address, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ADDRESS, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- agreement ---

    public function agreementAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at
            FROM structs.agreement
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function agreementByProvider(string $provider_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, provider_id, allocation_id, capacity, start_block, end_block, creator, owner, created_at, updated_at
            FROM structs.agreement
            WHERE provider_id = :provider_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PROVIDER_ID => $provider_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PROVIDER_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
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
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, allocation_type, source_id, index, destination_id, creator, controller, locked, created_at, updated_at
            FROM structs.allocation
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function allocationBySource(string $source_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, allocation_type, source_id, index, destination_id, creator, controller, locked, created_at, updated_at
            FROM structs.allocation
            WHERE source_id = :source_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::SOURCE_ID => $source_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::SOURCE_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function allocationByDestination(string $destination_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, allocation_type, source_id, index, destination_id, creator, controller, locked, created_at, updated_at
            FROM structs.allocation
            WHERE destination_id = :destination_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::DESTINATION_ID => $destination_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::DESTINATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function allocationByCreator(string $creator, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, allocation_type, source_id, index, destination_id, creator, controller, locked, created_at, updated_at
            FROM structs.allocation
            WHERE creator = :creator
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::CREATOR => $creator, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::CREATOR, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function allocationByController(string $controller, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, allocation_type, source_id, index, destination_id, creator, controller, locked, created_at, updated_at
            FROM structs.allocation
            WHERE controller = :controller
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::CONTROLLER => $controller, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::CONTROLLER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- banned_word ---

    public function bannedWordAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT value, created_at, updated_at
            FROM structs.banned_word
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- defusion ---

    public function defusionAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT validator_address, delegator_address, defusion_type, amount_p, amount, denom, completed_at, created_at
            FROM structs.defusion
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function defusionByValidator(string $validator_address, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT validator_address, delegator_address, defusion_type, amount_p, amount, denom, completed_at, created_at
            FROM structs.defusion
            WHERE validator_address = :validator_address
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::VALIDATOR_ADDRESS => $validator_address, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::VALIDATOR_ADDRESS, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function defusionByDelegator(string $delegator_address, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT validator_address, delegator_address, defusion_type, amount_p, amount, denom, completed_at, created_at
            FROM structs.defusion
            WHERE delegator_address = :delegator_address
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::DELEGATOR_ADDRESS => $delegator_address, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::DELEGATOR_ADDRESS, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- fleet ---

    public function fleetAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, owner, map, space_slots, air_slots, land_slots, water_slots, location_type, location_id, status,
                location_list_forward, location_list_backward, command_struct, created_at, updated_at
            FROM structs.fleet
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function fleetByLocation(string $location_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, owner, map, space_slots, air_slots, land_slots, water_slots, location_type, location_id, status,
                location_list_forward, location_list_backward, command_struct, created_at, updated_at
            FROM structs.fleet
            WHERE location_id = :location_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::LOCATION_ID => $location_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::LOCATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- grid ---

    public function gridAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, attribute_type, object_type, object_index, object_id, val, updated_at
            FROM structs.grid
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function gridByObject(string $object_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, attribute_type, object_type, object_index, object_id, val, updated_at
            FROM structs.grid
            WHERE object_id = :object_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OBJECT_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function gridByAttributeType(string $attribute_type, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, attribute_type, object_type, object_index, object_id, val, updated_at
            FROM structs.grid
            WHERE attribute_type = :attribute_type
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ATTRIBUTE_TYPE => $attribute_type, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ATTRIBUTE_TYPE, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- guild (list routes only; single guild still on GuildController) ---

    public function guildAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request,
                join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, creator, owner, created_at, updated_at
            FROM structs.guild
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function guildByPrimaryReactor(string $primary_reactor_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request,
                join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, creator, owner, created_at, updated_at
            FROM structs.guild
            WHERE primary_reactor_id = :primary_reactor_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PRIMARY_REACTOR_ID => $primary_reactor_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PRIMARY_REACTOR_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function guildByEntrySubstation(string $entry_substation_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request,
                join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, creator, owner, created_at, updated_at
            FROM structs.guild
            WHERE entry_substation_id = :entry_substation_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ENTRY_SUBSTATION_ID => $entry_substation_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ENTRY_SUBSTATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function guildByOwner(string $owner, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, endpoint, join_infusion_minimum, join_infusion_minimum_p, join_infusion_minimum_bypass_by_request,
                join_infusion_minimum_bypass_by_invite, primary_reactor_id, entry_substation_id, creator, owner, created_at, updated_at
            FROM structs.guild
            WHERE owner = :owner
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OWNER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- infusion (raw rows; distinct from InfusionController guild join) ---

    public function infusionAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT destination_id, address, destination_type, player_id, fuel, defusing, power, ratio, commission, created_at, updated_at
            FROM structs.infusion
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function infusionByDestination(string $destination_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT destination_id, address, destination_type, player_id, fuel, defusing, power, ratio, commission, created_at, updated_at
            FROM structs.infusion
            WHERE destination_id = :destination_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::DESTINATION_ID => $destination_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::DESTINATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function infusionByAddress(string $address, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT destination_id, address, destination_type, player_id, fuel, defusing, power, ratio, commission, created_at, updated_at
            FROM structs.infusion
            WHERE address = :address
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ADDRESS => $address, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ADDRESS, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function infusionByPlayerList(string $player_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT destination_id, address, destination_type, player_id, fuel, defusing, power, ratio, commission, created_at, updated_at
            FROM structs.infusion
            WHERE player_id = :player_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PLAYER_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- ledger (under /api/ledger/list/... to avoid tx_id collision) ---

    public function ledgerListAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT time, id, address, counterparty, amount, amount_p, block_height, action::text AS action, direction::text AS direction, denom
            FROM structs.ledger
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function ledgerListByPlayer(string $player_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT l.time, l.id, l.address, l.counterparty, l.amount, l.amount_p, l.block_height, l.action::text AS action, l.direction::text AS direction, l.denom
            FROM structs.ledger l
            INNER JOIN structs.player_address pa ON pa.address = l.address AND pa.player_id = :player_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PLAYER_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function ledgerListByAddress(string $address, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT time, id, address, counterparty, amount, amount_p, block_height, action::text AS action, direction::text AS direction, denom
            FROM structs.ledger
            WHERE address = :address
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ADDRESS => $address, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ADDRESS, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- permission ---

    public function permissionAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_type, object_index, object_id, player_id, val, updated_at
            FROM structs.permission
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function permissionByObject(string $object_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_type, object_index, object_id, player_id, val, updated_at
            FROM structs.permission
            WHERE object_id = :object_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OBJECT_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function permissionByPlayer(string $player_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_type, object_index, object_id, player_id, val, updated_at
            FROM structs.permission
            WHERE player_id = :player_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PLAYER_ID => $player_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PLAYER_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- planet ---

    public function planetListAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, max_ore, creator, owner, map, space_slots, air_slots, land_slots, water_slots, status,
                location_list_start, location_list_end, created_at, updated_at
            FROM structs.planet
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function planetListByOwner(string $owner, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, max_ore, creator, owner, map, space_slots, air_slots, land_slots, water_slots, status,
                location_list_start, location_list_end, created_at, updated_at
            FROM structs.planet
            WHERE owner = :owner
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OWNER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- player ---

    public function playerListAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, creator, primary_address, guild_id, substation_id, planet_id, fleet_id, created_at, updated_at
            FROM structs.player
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function playerListByGuild(string $guild_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, creator, primary_address, guild_id, substation_id, planet_id, fleet_id, created_at, updated_at
            FROM structs.player
            WHERE guild_id = :guild_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::GUILD_ID => $guild_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::GUILD_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function playerListBySubstation(string $substation_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, creator, primary_address, guild_id, substation_id, planet_id, fleet_id, created_at, updated_at
            FROM structs.player
            WHERE substation_id = :substation_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::SUBSTATION_ID => $substation_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::SUBSTATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- provider ---

    public function providerAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum,
                duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty,
                creator, owner, created_at, updated_at
            FROM structs.provider
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function providerByOwner(string $owner, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum,
                duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty,
                creator, owner, created_at, updated_at
            FROM structs.provider
            WHERE owner = :owner
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OWNER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function providerByDenom(string $denom, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum,
                duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty,
                creator, owner, created_at, updated_at
            FROM structs.provider
            WHERE rate_denom = :denom
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::DENOM => $denom, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::DENOM, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function providerBySubstation(string $substation_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, substation_id, rate_amount, rate_denom, access_policy, capacity_minimum, capacity_maximum,
                duration_minimum, duration_maximum, provider_cancellation_penalty, consumer_cancellation_penalty,
                creator, owner, created_at, updated_at
            FROM structs.provider
            WHERE substation_id = :substation_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::SUBSTATION_ID => $substation_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::SUBSTATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- reactor ---

    public function reactorAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, validator, guild_id, default_commission, created_at, updated_at
            FROM structs.reactor
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function reactorByValidator(string $validator_address, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, validator, guild_id, default_commission, created_at, updated_at
            FROM structs.reactor
            WHERE validator = :validator_address
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::VALIDATOR_ADDRESS => $validator_address, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::VALIDATOR_ADDRESS, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function reactorByGuild(string $guild_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, validator, guild_id, default_commission, created_at, updated_at
            FROM structs.reactor
            WHERE guild_id = :guild_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::GUILD_ID => $guild_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::GUILD_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function reactorByOwner(string $owner, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT r.id, r.validator, r.guild_id, r.default_commission, r.created_at, r.updated_at
            FROM structs.reactor r
            INNER JOIN structs.guild g ON g.id = r.guild_id
            WHERE g.owner = :owner
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OWNER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- substation ---

    public function substationAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, owner, creator, created_at, updated_at
            FROM structs.substation
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function substationByOwner(string $owner, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, owner, creator, created_at, updated_at
            FROM structs.substation
            WHERE owner = :owner
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OWNER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- struct ---

    public function structListAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, type, creator, owner, location_type, location_id, operating_ambit, slot, created_at, updated_at
            FROM structs.struct
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function structListByOwner(string $owner, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, type, creator, owner, location_type, location_id, operating_ambit, slot, created_at, updated_at
            FROM structs.struct
            WHERE owner = :owner
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OWNER => $owner, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OWNER, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function structListByLocation(string $location_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, index, type, creator, owner, location_type, location_id, operating_ambit, slot, created_at, updated_at
            FROM structs.struct
            WHERE location_id = :location_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::LOCATION_ID => $location_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::LOCATION_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- struct_attribute ---

    public function structAttributeAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_id, object_type, sub_index, attribute_type, val, updated_at
            FROM structs.struct_attribute
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function structAttributeByObject(string $object_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_id, object_type, sub_index, attribute_type, val, updated_at
            FROM structs.struct_attribute
            WHERE object_id = :object_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OBJECT_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function structAttributeByType(string $attribute_type, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_id, object_type, sub_index, attribute_type, val, updated_at
            FROM structs.struct_attribute
            WHERE attribute_type = :attribute_type
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ATTRIBUTE_TYPE => $attribute_type, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ATTRIBUTE_TYPE, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    // --- planet_attribute ---

    public function planetAttributeAll(int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_id, object_type, attribute_type, val, updated_at
            FROM structs.planet_attribute
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function planetAttributeByObject(string $object_id, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_id, object_type, attribute_type, val, updated_at
            FROM structs.planet_attribute
            WHERE object_id = :object_id
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::OBJECT_ID => $object_id, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::OBJECT_ID, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }

    public function planetAttributeByType(string $attribute_type, int $page): Response
    {
        [$limit, $offset] = $this->limitOffset($page);
        $sql = "SELECT id, object_id, object_type, attribute_type, val, updated_at
            FROM structs.planet_attribute
            WHERE attribute_type = :attribute_type
            LIMIT $limit OFFSET $offset";
        $params = [ApiParameters::ATTRIBUTE_TYPE => $attribute_type, ApiParameters::PAGE => (string) $page];
        $required = [ApiParameters::ATTRIBUTE_TYPE, ApiParameters::PAGE];

        return $this->queryAll($this->entityManager, $this->apiRequestParsingManager, $sql, $params, $required);
    }
}
