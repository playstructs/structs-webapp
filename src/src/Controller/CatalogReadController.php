<?php

namespace App\Controller;

use App\Manager\TableReadManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Read-only catalog endpoints. Every list route constrains {page} to digits so
 * Symfony rejects non-numeric values with 404 instead of letting Symfony fail
 * later when binding `int $page` (which would surface as a TypeError 500).
 */
class CatalogReadController extends AbstractController
{
    private const string PAGE_REQUIREMENT = '\d+';

    private function manager(EntityManagerInterface $em, ValidatorInterface $v): TableReadManager
    {
        return new TableReadManager($em, $v);
    }

    // --- address_tag ---

    #[Route('/api/address-tag/all/page/{page}', name: 'api_address_tag_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function addressTagAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->addressTagAll($page);
    }

    #[Route('/api/address-tag/address/{address}/page/{page}', name: 'api_address_tag_by_address', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function addressTagByAddress(
        string $address,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->addressTagByAddress($address, $page);
    }

    // --- agreement ---

    #[Route('/api/agreement/all/page/{page}', name: 'api_agreement_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function agreementAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->agreementAll($page);
    }

    #[Route('/api/agreement/provider/{provider_id}/page/{page}', name: 'api_agreement_by_provider', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function agreementByProvider(
        string $provider_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->agreementByProvider($provider_id, $page);
    }

    #[Route('/api/agreement/allocation/{allocation_id}', name: 'api_agreement_by_allocation', methods: ['GET'])]
    public function agreementByAllocation(
        string $allocation_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->agreementByAllocation($allocation_id);
    }

    #[Route('/api/agreement/creator/{creator}', name: 'api_agreement_by_creator', methods: ['GET'])]
    public function agreementByCreator(
        string $creator,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->agreementByCreator($creator);
    }

    #[Route('/api/agreement/owner/{owner}', name: 'api_agreement_by_owner', methods: ['GET'])]
    public function agreementByOwner(
        string $owner,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->agreementByOwner($owner);
    }

    // --- allocation ---

    #[Route('/api/allocation/all/page/{page}', name: 'api_allocation_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function allocationAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->allocationAll($page);
    }

    #[Route('/api/allocation/source/{source_id}/page/{page}', name: 'api_allocation_by_source', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function allocationBySource(
        string $source_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->allocationBySource($source_id, $page);
    }

    #[Route('/api/allocation/destination/{destination_id}/page/{page}', name: 'api_allocation_by_destination', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function allocationByDestination(
        string $destination_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->allocationByDestination($destination_id, $page);
    }

    #[Route('/api/allocation/creator/{creator}/page/{page}', name: 'api_allocation_by_creator', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function allocationByCreator(
        string $creator,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->allocationByCreator($creator, $page);
    }

    #[Route('/api/allocation/controller/{controller}/page/{page}', name: 'api_allocation_by_controller', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function allocationByController(
        string $controller,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->allocationByController($controller, $page);
    }

    // --- banned_word ---

    #[Route('/api/banned-word/all', name: 'api_banned_word_all', methods: ['GET'])]
    public function bannedWordAll(
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->bannedWordAll();
    }

    // --- defusion ---

    #[Route('/api/defusion/all/page/{page}', name: 'api_defusion_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function defusionAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->defusionAll($page);
    }

    #[Route('/api/defusion/validator/{validator_address}/page/{page}', name: 'api_defusion_by_validator', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function defusionByValidator(
        string $validator_address,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->defusionByValidator($validator_address, $page);
    }

    #[Route('/api/defusion/delegator/{delegator_address}/page/{page}', name: 'api_defusion_by_delegator', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function defusionByDelegator(
        string $delegator_address,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->defusionByDelegator($delegator_address, $page);
    }

    // --- fleet ---

    #[Route('/api/fleet/list/all/page/{page}', name: 'api_fleet_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function fleetAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->fleetAll($page);
    }

    #[Route('/api/fleet/list/location/{location_id}/page/{page}', name: 'api_fleet_list_by_location', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function fleetByLocation(
        string $location_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->fleetByLocation($location_id, $page);
    }

    // --- grid ---

    #[Route('/api/grid/all/page/{page}', name: 'api_grid_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function gridAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->gridAll($page);
    }

    #[Route('/api/grid/object/{object_id}/page/{page}', name: 'api_grid_by_object', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function gridByObject(
        string $object_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->gridByObject($object_id, $page);
    }

    #[Route('/api/grid/attribute-type/{attribute_type}/page/{page}', name: 'api_grid_by_attribute_type', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function gridByAttributeType(
        string $attribute_type,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->gridByAttributeType($attribute_type, $page);
    }

    // --- guild list ---

    #[Route('/api/guild/list/all/page/{page}', name: 'api_guild_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildAll($page);
    }

    #[Route('/api/guild/list/primary-reactor/{primary_reactor_id}/page/{page}', name: 'api_guild_list_by_primary_reactor', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildByPrimaryReactor(
        string $primary_reactor_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildByPrimaryReactor($primary_reactor_id, $page);
    }

    #[Route('/api/guild/list/entry-substation/{entry_substation_id}/page/{page}', name: 'api_guild_list_by_entry_substation', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildByEntrySubstation(
        string $entry_substation_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildByEntrySubstation($entry_substation_id, $page);
    }

    #[Route('/api/guild/list/owner/{owner}/page/{page}', name: 'api_guild_list_by_owner', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildByOwner(
        string $owner,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildByOwner($owner, $page);
    }

    // --- guild_membership_application ---

    #[Route('/api/guild-membership-application/all/page/{page}', name: 'api_guild_membership_application_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildMembershipApplicationAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildMembershipApplicationAll($page);
    }

    #[Route('/api/guild-membership-application/guild/{guild_id}/page/{page}', name: 'api_guild_membership_application_by_guild', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildMembershipApplicationByGuild(
        string $guild_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildMembershipApplicationByGuild($guild_id, $page);
    }

    #[Route('/api/guild-membership-application/player/{player_id}/page/{page}', name: 'api_guild_membership_application_by_player', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function guildMembershipApplicationByPlayer(
        string $player_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->guildMembershipApplicationByPlayer($player_id, $page);
    }

    // --- infusion list ---

    #[Route('/api/infusion/list/all/page/{page}', name: 'api_infusion_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function infusionAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->infusionAll($page);
    }

    #[Route('/api/infusion/list/destination/{destination_id}/page/{page}', name: 'api_infusion_list_by_destination', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function infusionByDestination(
        string $destination_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->infusionByDestination($destination_id, $page);
    }

    #[Route('/api/infusion/list/address/{address}/page/{page}', name: 'api_infusion_list_by_address', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function infusionByAddress(
        string $address,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->infusionByAddress($address, $page);
    }

    #[Route('/api/infusion/list/player/{player_id}/page/{page}', name: 'api_infusion_list_by_player', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function infusionByPlayerList(
        string $player_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->infusionByPlayerList($player_id, $page);
    }

    // --- ledger list (avoid /api/ledger/{tx_id} shadowing) ---

    #[Route('/api/ledger/list/all/page/{page}', name: 'api_ledger_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function ledgerListAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->ledgerListAll($page);
    }

    #[Route('/api/ledger/list/player/{player_id}/page/{page}', name: 'api_ledger_list_by_player', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function ledgerListByPlayer(
        string $player_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->ledgerListByPlayer($player_id, $page);
    }

    #[Route('/api/ledger/list/address/{address}/page/{page}', name: 'api_ledger_list_by_address', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function ledgerListByAddress(
        string $address,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->ledgerListByAddress($address, $page);
    }

    // --- permission ---

    #[Route('/api/permission/all/page/{page}', name: 'api_permission_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function permissionAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->permissionAll($page);
    }

    #[Route('/api/permission/object/{object_id}/page/{page}', name: 'api_permission_by_object', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function permissionByObject(
        string $object_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->permissionByObject($object_id, $page);
    }

    #[Route('/api/permission/player/{player_id}/page/{page}', name: 'api_permission_by_player', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function permissionByPlayer(
        string $player_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->permissionByPlayer($player_id, $page);
    }

    // --- permission_guild_rank ---

    #[Route('/api/permission-guild-rank/all/page/{page}', name: 'api_permission_guild_rank_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function permissionGuildRankAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->permissionGuildRankAll($page);
    }

    #[Route('/api/permission-guild-rank/object/{object_id}/page/{page}', name: 'api_permission_guild_rank_by_object', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function permissionGuildRankByObject(
        string $object_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->permissionGuildRankByObject($object_id, $page);
    }

    #[Route('/api/permission-guild-rank/guild/{guild_id}/page/{page}', name: 'api_permission_guild_rank_by_guild', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function permissionGuildRankByGuild(
        string $guild_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->permissionGuildRankByGuild($guild_id, $page);
    }

    // --- planet list ---

    #[Route('/api/planet/list/all/page/{page}', name: 'api_planet_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetListAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetListAll($page);
    }

    #[Route('/api/planet/list/owner/{owner}/page/{page}', name: 'api_planet_list_by_owner', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetListByOwner(
        string $owner,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetListByOwner($owner, $page);
    }

    // --- planet_activity ---

    #[Route('/api/planet-activity/all/page/{page}', name: 'api_planet_activity_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetActivityAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetActivityAll($page);
    }

    #[Route('/api/planet-activity/planet/{planet_id}/page/{page}', name: 'api_planet_activity_by_planet', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetActivityByPlanet(
        string $planet_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetActivityByPlanet($planet_id, $page);
    }

    #[Route('/api/planet-activity/category/{category}/page/{page}', name: 'api_planet_activity_by_category', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetActivityByCategory(
        string $category,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetActivityByCategory($category, $page);
    }

    // --- player list ---

    #[Route('/api/player/list/all/page/{page}', name: 'api_player_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function playerListAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->playerListAll($page);
    }

    #[Route('/api/player/list/guild/{guild_id}/page/{page}', name: 'api_player_list_by_guild', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function playerListByGuild(
        string $guild_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->playerListByGuild($guild_id, $page);
    }

    #[Route('/api/player/list/substation/{substation_id}/page/{page}', name: 'api_player_list_by_substation', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function playerListBySubstation(
        string $substation_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->playerListBySubstation($substation_id, $page);
    }

    // --- provider ---

    #[Route('/api/provider/all/page/{page}', name: 'api_provider_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function providerAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->providerAll($page);
    }

    #[Route('/api/provider/owner/{owner}/page/{page}', name: 'api_provider_by_owner', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function providerByOwner(
        string $owner,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->providerByOwner($owner, $page);
    }

    #[Route('/api/provider/denom/{denom}/page/{page}', name: 'api_provider_by_denom', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function providerByDenom(
        string $denom,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->providerByDenom($denom, $page);
    }

    #[Route('/api/provider/substation/{substation_id}/page/{page}', name: 'api_provider_by_substation', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function providerBySubstation(
        string $substation_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->providerBySubstation($substation_id, $page);
    }

    // --- reactor ---

    #[Route('/api/reactor/all/page/{page}', name: 'api_reactor_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function reactorAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->reactorAll($page);
    }

    #[Route('/api/reactor/validator/{validator_address}/page/{page}', name: 'api_reactor_by_validator', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function reactorByValidator(
        string $validator_address,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->reactorByValidator($validator_address, $page);
    }

    #[Route('/api/reactor/guild/{guild_id}/page/{page}', name: 'api_reactor_by_guild', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function reactorByGuild(
        string $guild_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->reactorByGuild($guild_id, $page);
    }

    #[Route('/api/reactor/owner/{owner}/page/{page}', name: 'api_reactor_by_owner', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function reactorByOwner(
        string $owner,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->reactorByOwner($owner, $page);
    }

    // --- substation ---

    #[Route('/api/substation/all/page/{page}', name: 'api_substation_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function substationAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->substationAll($page);
    }

    #[Route('/api/substation/owner/{owner}/page/{page}', name: 'api_substation_by_owner', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function substationByOwner(
        string $owner,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->substationByOwner($owner, $page);
    }

    // --- struct list ---

    #[Route('/api/struct/list/all/page/{page}', name: 'api_struct_list_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structListAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structListAll($page);
    }

    #[Route('/api/struct/list/owner/{owner}/page/{page}', name: 'api_struct_list_by_owner', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structListByOwner(
        string $owner,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structListByOwner($owner, $page);
    }

    #[Route('/api/struct/list/location/{location_id}/page/{page}', name: 'api_struct_list_by_location', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structListByLocation(
        string $location_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structListByLocation($location_id, $page);
    }

    // --- struct_attribute ---

    #[Route('/api/struct-attribute/all/page/{page}', name: 'api_struct_attribute_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structAttributeAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structAttributeAll($page);
    }

    #[Route('/api/struct-attribute/object/{object_id}/page/{page}', name: 'api_struct_attribute_by_object', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structAttributeByObject(
        string $object_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structAttributeByObject($object_id, $page);
    }

    #[Route('/api/struct-attribute/type/{attribute_type}/page/{page}', name: 'api_struct_attribute_by_type', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structAttributeByType(
        string $attribute_type,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structAttributeByType($attribute_type, $page);
    }

    // --- struct_defender ---

    #[Route('/api/struct-defender/all/page/{page}', name: 'api_struct_defender_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structDefenderAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structDefenderAll($page);
    }

    #[Route('/api/struct-defender/defending/{defending_struct_id}', name: 'api_struct_defender_by_defending', methods: ['GET'])]
    public function structDefenderByDefending(
        string $defending_struct_id,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structDefenderByDefending($defending_struct_id);
    }

    #[Route('/api/struct-defender/protected/{protected_struct_id}/page/{page}', name: 'api_struct_defender_by_protected', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function structDefenderByProtected(
        string $protected_struct_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->structDefenderByProtected($protected_struct_id, $page);
    }

    // --- planet_attribute ---

    #[Route('/api/planet-attribute/all/page/{page}', name: 'api_planet_attribute_all', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetAttributeAll(
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetAttributeAll($page);
    }

    #[Route('/api/planet-attribute/object/{object_id}/page/{page}', name: 'api_planet_attribute_by_object', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetAttributeByObject(
        string $object_id,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetAttributeByObject($object_id, $page);
    }

    #[Route('/api/planet-attribute/type/{attribute_type}/page/{page}', name: 'api_planet_attribute_by_type', requirements: ['page' => self::PAGE_REQUIREMENT], methods: ['GET'])]
    public function planetAttributeByType(
        string $attribute_type,
        int $page,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): Response {
        return $this->manager($entityManager, $validator)->planetAttributeByType($attribute_type, $page);
    }
}
