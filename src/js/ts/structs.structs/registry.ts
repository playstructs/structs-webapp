import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgFleetMoveResponse } from "./types/structs/structs/tx";
import { MsgPermissionSetOnObject } from "./types/structs/structs/tx";
import { EventGuild } from "./types/structs/structs/events";
import { EventOreTheft } from "./types/structs/structs/events";
import { MsgStructMove } from "./types/structs/structs/tx";
import { MsgStructOreMinerComplete } from "./types/structs/structs/tx";
import { QueryAllAddressByPlayerRequest } from "./types/structs/structs/query";
import { EventOreMigrateDetail } from "./types/structs/structs/events";
import { MsgGuildBankRedeemResponse } from "./types/structs/structs/tx";
import { MsgStructBuildComplete } from "./types/structs/structs/tx";
import { MsgStructDefenseSet } from "./types/structs/structs/tx";
import { MsgProviderUpdateAccessPolicy } from "./types/structs/structs/tx";
import { QueryAllFleetRequest } from "./types/structs/structs/query";
import { MsgAllocationCreate } from "./types/structs/structs/tx";
import { MsgPermissionResponse } from "./types/structs/structs/tx";
import { QueryParamsRequest } from "./types/structs/structs/query";
import { QueryAllFleetResponse } from "./types/structs/structs/query";
import { PlayerInventory } from "./types/structs/structs/player";
import { EventProviderGrantGuildDetail } from "./types/structs/structs/events";
import { EventGuildBankMintDetail } from "./types/structs/structs/events";
import { MsgSubstationCreateResponse } from "./types/structs/structs/tx";
import { MsgSubstationPlayerMigrateResponse } from "./types/structs/structs/tx";
import { MsgProviderUpdateCapacityMinimum } from "./types/structs/structs/tx";
import { QueryGetGuildMembershipApplicationResponse } from "./types/structs/structs/query";
import { QueryGetPlayerResponse } from "./types/structs/structs/query";
import { QueryGetSubstationResponse } from "./types/structs/structs/query";
import { StructDefender } from "./types/structs/structs/struct";
import { MsgReactorDefuseResponse } from "./types/structs/structs/tx";
import { MsgStructAttack } from "./types/structs/structs/tx";
import { EventTime } from "./types/structs/structs/events";
import { MsgSubstationDelete } from "./types/structs/structs/tx";
import { Guild } from "./types/structs/structs/guild";
import { QueryGetProviderRequest } from "./types/structs/structs/query";
import { MsgAllocationUpdate } from "./types/structs/structs/tx";
import { MsgSubstationPlayerDisconnectResponse } from "./types/structs/structs/tx";
import { EventAlphaRefineDetail } from "./types/structs/structs/events";
import { MsgAllocationDeleteResponse } from "./types/structs/structs/tx";
import { MsgGuildMembershipInviteRevoke } from "./types/structs/structs/tx";
import { MsgProviderUpdateDurationMinimum } from "./types/structs/structs/tx";
import { InternalAddressAssociation } from "./types/structs/structs/address";
import { Params } from "./types/structs/structs/params";
import { PermissionRecord } from "./types/structs/structs/permission";
import { EventReactor } from "./types/structs/structs/events";
import { EventStructAttribute } from "./types/structs/structs/events";
import { MsgAddressRevoke } from "./types/structs/structs/tx";
import { MsgSubstationPlayerConnectResponse } from "./types/structs/structs/tx";
import { QueryGetFleetRequest } from "./types/structs/structs/query";
import { QueryGetInfusionResponse } from "./types/structs/structs/query";
import { QueryGetStructTypeRequest } from "./types/structs/structs/query";
import { EventAttackDefenderCounterDetail } from "./types/structs/structs/events";
import { MsgStructGeneratorInfuse } from "./types/structs/structs/tx";
import { QueryAllPlayerHaltedResponse } from "./types/structs/structs/query";
import { EventProviderRevokeGuildDetail } from "./types/structs/structs/events";
import { PlanetAttributeRecord } from "./types/structs/structs/planet";
import { MsgPlanetExploreResponse } from "./types/structs/structs/tx";
import { QueryGetStructTypeResponse } from "./types/structs/structs/query";
import { EventInfusion } from "./types/structs/structs/events";
import { PlanetAttributes } from "./types/structs/structs/planet";
import { MsgStructOreRefineryStatusResponse } from "./types/structs/structs/tx";
import { QueryAllAgreementByProviderRequest } from "./types/structs/structs/query";
import { QueryAllGuildResponse } from "./types/structs/structs/query";
import { QueryGetGuildMembershipApplicationRequest } from "./types/structs/structs/query";
import { QueryGetProviderByCollateralAddressRequest } from "./types/structs/structs/query";
import { EventGuildBankAddressDetail } from "./types/structs/structs/events";
import { MsgGuildUpdateJoinInfusionMinimumBypassByRequest } from "./types/structs/structs/tx";
import { MsgPermissionRevokeOnAddress } from "./types/structs/structs/tx";
import { QueryParamsResponse } from "./types/structs/structs/query";
import { QueryAllPlanetRequest } from "./types/structs/structs/query";
import { QueryAllPlayerResponse } from "./types/structs/structs/query";
import { MsgAddressRevokeResponse } from "./types/structs/structs/tx";
import { MsgStructActivate } from "./types/structs/structs/tx";
import { MsgStructGeneratorStatusResponse } from "./types/structs/structs/tx";
import { MsgAgreementCapacityIncrease } from "./types/structs/structs/tx";
import { QueryGetGuildByBankCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryValidateSignatureRequest } from "./types/structs/structs/query";
import { MsgPlanetRaidComplete } from "./types/structs/structs/tx";
import { QueryAllAgreementRequest } from "./types/structs/structs/query";
import { QueryAllStructResponse } from "./types/structs/structs/query";
import { QueryAllSubstationResponse } from "./types/structs/structs/query";
import { EventPlayerResumed } from "./types/structs/structs/events";
import { QueryAllGuildBankCollateralAddressRequest } from "./types/structs/structs/query";
import { EventStructDefender } from "./types/structs/structs/events";
import { EventAttackDetail } from "./types/structs/structs/events";
import { MsgAddressRegister } from "./types/structs/structs/tx";
import { MsgGuildMembershipRequestApprove } from "./types/structs/structs/tx";
import { MsgStructOreMinerStatusResponse } from "./types/structs/structs/tx";
import { QueryAllAllocationRequest } from "./types/structs/structs/query";
import { QueryAllAllocationBySourceRequest } from "./types/structs/structs/query";
import { GridAttributes } from "./types/structs/structs/grid";
import { StructsPacketData } from "./types/structs/structs/packet";
import { EventSubstation } from "./types/structs/structs/events";
import { MsgFleetMove } from "./types/structs/structs/tx";
import { MsgGuildBankRedeem } from "./types/structs/structs/tx";
import { QueryGetFleetByIndexRequest } from "./types/structs/structs/query";
import { QueryGetGridResponse } from "./types/structs/structs/query";
import { QueryGetInfusionRequest } from "./types/structs/structs/query";
import { QueryAllInfusionResponse } from "./types/structs/structs/query";
import { EventProviderAddressDetail } from "./types/structs/structs/events";
import { MsgGuildUpdateEndpoint } from "./types/structs/structs/tx";
import { MsgAgreementDurationIncrease } from "./types/structs/structs/tx";
import { QueryAllAllocationResponse } from "./types/structs/structs/query";
import { QueryAllReactorResponse } from "./types/structs/structs/query";
import { EventStructType } from "./types/structs/structs/events";
import { EventGrid } from "./types/structs/structs/events";
import { EventGuildBankRedeem } from "./types/structs/structs/events";
import { EventOreMineDetail } from "./types/structs/structs/events";
import { QueryAllAllocationByDestinationRequest } from "./types/structs/structs/query";
import { Player } from "./types/structs/structs/player";
import { MsgPlayerResumeResponse } from "./types/structs/structs/tx";
import { MsgStructStatusResponse } from "./types/structs/structs/tx";
import { MsgStructStorageRecall } from "./types/structs/structs/tx";
import { MsgAgreementResponse } from "./types/structs/structs/tx";
import { MsgProviderCreate } from "./types/structs/structs/tx";
import { MsgPlayerSendResponse } from "./types/structs/structs/tx";
import { QueryAllAddressRequest } from "./types/structs/structs/query";
import { QueryGetReactorResponse } from "./types/structs/structs/query";
import { EventProviderGrantGuild } from "./types/structs/structs/events";
import { EventGuildBankConfiscateAndBurn } from "./types/structs/structs/events";
import { QueryBlockHeightResponse } from "./types/structs/structs/query";
import { QueryAllPlanetByPlayerRequest } from "./types/structs/structs/query";
import { MsgGuildMembershipRequestRevoke } from "./types/structs/structs/tx";
import { QueryAllStructAttributeRequest } from "./types/structs/structs/query";
import { Reactor } from "./types/structs/structs/reactor";
import { EventAttack } from "./types/structs/structs/events";
import { MsgSubstationAllocationDisconnectResponse } from "./types/structs/structs/tx";
import { MsgAgreementCapacityDecrease } from "./types/structs/structs/tx";
import { QueryAllGuildBankCollateralAddressResponse } from "./types/structs/structs/query";
import { QueryAllSubstationRequest } from "./types/structs/structs/query";
import { QueryValidateSignatureResponse } from "./types/structs/structs/query";
import { EventFleet } from "./types/structs/structs/events";
import { Provider } from "./types/structs/structs/provider";
import { QueryBlockHeight } from "./types/structs/structs/query";
import { QueryGetReactorRequest } from "./types/structs/structs/query";
import { GridRecord } from "./types/structs/structs/grid";
import { MsgGuildUpdateJoinInfusionMinimumBypassByInvite } from "./types/structs/structs/tx";
import { MsgReactorInfuseResponse } from "./types/structs/structs/tx";
import { MsgStructBuildCancel } from "./types/structs/structs/tx";
import { Substation } from "./types/structs/structs/substation";
import { MsgGuildUpdateOwnerId } from "./types/structs/structs/tx";
import { MsgGuildMembershipInviteDeny } from "./types/structs/structs/tx";
import { MsgSubstationDeleteResponse } from "./types/structs/structs/tx";
import { Fleet } from "./types/structs/structs/fleet";
import { QueryAllPlanetAttributeRequest } from "./types/structs/structs/query";
import { QueryAllReactorRequest } from "./types/structs/structs/query";
import { EventProvider } from "./types/structs/structs/events";
import { EventGuildBankRedeemDetail } from "./types/structs/structs/events";
import { MsgPlayerResume } from "./types/structs/structs/tx";
import { MsgProviderWithdrawBalance } from "./types/structs/structs/tx";
import { MsgProviderUpdateDurationMaximum } from "./types/structs/structs/tx";
import { QueryAllInfusionRequest } from "./types/structs/structs/query";
import { QueryGetProviderResponse } from "./types/structs/structs/query";
import { QueryAllProviderCollateralAddressResponse } from "./types/structs/structs/query";
import { NoData } from "./types/structs/structs/packet";
import { MsgReactorBeginMigration } from "./types/structs/structs/tx";
import { MsgReactorBeginMigrationResponse } from "./types/structs/structs/tx";
import { MsgSubstationPlayerDisconnect } from "./types/structs/structs/tx";
import { GuildMembershipApplication } from "./types/structs/structs/guild";
import { QueryGetAllocationRequest } from "./types/structs/structs/query";
import { EventAgreement } from "./types/structs/structs/events";
import { MsgAllocationDelete } from "./types/structs/structs/tx";
import { MsgAgreementOpen } from "./types/structs/structs/tx";
import { MsgPlayerSend } from "./types/structs/structs/tx";
import { QueryGetGuildRequest } from "./types/structs/structs/query";
import { Planet } from "./types/structs/structs/planet";
import { MsgAllocationTransferResponse } from "./types/structs/structs/tx";
import { MsgStructDefenseClear } from "./types/structs/structs/tx";
import { QueryAllAgreementResponse } from "./types/structs/structs/query";
import { QueryAllPermissionByObjectRequest } from "./types/structs/structs/query";
import { QueryAllStructAttributeResponse } from "./types/structs/structs/query";
import { EventAlphaDefuseDetail } from "./types/structs/structs/events";
import { MsgGuildMembershipJoinProxy } from "./types/structs/structs/tx";
import { MsgStructBuildInitiate } from "./types/structs/structs/tx";
import { GenesisState } from "./types/structs/structs/genesis";
import { QueryGetFleetResponse } from "./types/structs/structs/query";
import { QueryAllGuildRequest } from "./types/structs/structs/query";
import { QueryGetPlanetAttributeResponse } from "./types/structs/structs/query";
import { MsgGuildBankMintResponse } from "./types/structs/structs/tx";
import { MsgGuildBankConfiscateAndBurn } from "./types/structs/structs/tx";
import { MsgSubstationPlayerConnect } from "./types/structs/structs/tx";
import { QueryAllGuildMembershipApplicationResponse } from "./types/structs/structs/query";
import { QueryAllProviderRequest } from "./types/structs/structs/query";
import { QueryGetProviderByEarningsAddressRequest } from "./types/structs/structs/query";
import { EventPlayer } from "./types/structs/structs/events";
import { EventProviderRevokeGuild } from "./types/structs/structs/events";
import { MsgAddressRegisterResponse } from "./types/structs/structs/tx";
import { MsgPermissionGrantOnObject } from "./types/structs/structs/tx";
import { QueryGetPlayerRequest } from "./types/structs/structs/query";
import { QueryAllStructTypeResponse } from "./types/structs/structs/query";
import { MsgPlanetRaidCompleteResponse } from "./types/structs/structs/tx";
import { MsgReactorDefuse } from "./types/structs/structs/tx";
import { MsgStructStealthActivate } from "./types/structs/structs/tx";
import { QueryGetGuildBankCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryAllGuildMembershipApplicationRequest } from "./types/structs/structs/query";
import { QueryAllPermissionRequest } from "./types/structs/structs/query";
import { QueryAllProviderEarningsAddressResponse } from "./types/structs/structs/query";
import { Struct } from "./types/structs/structs/struct";
import { EventProviderAddress } from "./types/structs/structs/events";
import { MsgSubstationAllocationDisconnect } from "./types/structs/structs/tx";
import { QueryGetAddressRequest } from "./types/structs/structs/query";
import { EventPlayerHalted } from "./types/structs/structs/events";
import { MsgUpdateParams } from "./types/structs/structs/tx";
import { MsgGuildBankMint } from "./types/structs/structs/tx";
import { MsgGuildUpdateJoinInfusionMinimum } from "./types/structs/structs/tx";
import { QueryAllPermissionResponse } from "./types/structs/structs/query";
import { EventAllocation } from "./types/structs/structs/events";
import { EventTimeDetail } from "./types/structs/structs/events";
import { MsgPlayerUpdatePrimaryAddress } from "./types/structs/structs/tx";
import { QueryGetAgreementRequest } from "./types/structs/structs/query";
import { MsgPermissionGrantOnAddress } from "./types/structs/structs/tx";
import { MsgPermissionSetOnAddress } from "./types/structs/structs/tx";
import { EventAddressActivity } from "./types/structs/structs/events";
import { EventRaid } from "./types/structs/structs/events";
import { MsgAllocationUpdateResponse } from "./types/structs/structs/tx";
import { MsgStructAttackResponse } from "./types/structs/structs/tx";
import { MsgSubstationCreate } from "./types/structs/structs/tx";
import { QueryAllPlanetAttributeResponse } from "./types/structs/structs/query";
import { QueryAllProviderEarningsAddressRequest } from "./types/structs/structs/query";
import { QueryAllPlayerRequest } from "./types/structs/structs/query";
import { QueryGetStructAttributeRequest } from "./types/structs/structs/query";
import { EventGuildBankAddress } from "./types/structs/structs/events";
import { MsgAllocationCreateResponse } from "./types/structs/structs/tx";
import { Allocation } from "./types/structs/structs/allocation";
import { QueryAllPermissionByPlayerRequest } from "./types/structs/structs/query";
import { QueryAllProviderCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryGetProviderEarningsAddressRequest } from "./types/structs/structs/query";
import { MsgAllocationTransfer } from "./types/structs/structs/tx";
import { MsgGuildBankConfiscateAndBurnResponse } from "./types/structs/structs/tx";
import { MsgGuildMembershipKick } from "./types/structs/structs/tx";
import { QueryAllGridResponse } from "./types/structs/structs/query";
import { FleetAttributeRecord } from "./types/structs/structs/fleet";
import { MsgSubstationPlayerMigrate } from "./types/structs/structs/tx";
import { MsgProviderUpdateCapacityMaximum } from "./types/structs/structs/tx";
import { EventDelete } from "./types/structs/structs/events";
import { EventGuildBankMint } from "./types/structs/structs/events";
import { QueryGetGridRequest } from "./types/structs/structs/query";
import { QueryGetGuildResponse } from "./types/structs/structs/query";
import { QueryGetProviderCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryGetStructRequest } from "./types/structs/structs/query";
import { QueryGetStructAttributeResponse } from "./types/structs/structs/query";
import { QueryAllStructTypeRequest } from "./types/structs/structs/query";
import { EventAlphaRefine } from "./types/structs/structs/events";
import { QueryAllInfusionByDestinationRequest } from "./types/structs/structs/query";
import { QueryGetPermissionRequest } from "./types/structs/structs/query";
import { QueryGetStructResponse } from "./types/structs/structs/query";
import { QueryGetSubstationRequest } from "./types/structs/structs/query";
import { EventRaidDetail } from "./types/structs/structs/events";
import { MsgGuildMembershipInvite } from "./types/structs/structs/tx";
import { MsgGuildMembershipInviteApprove } from "./types/structs/structs/tx";
import { QueryGetAllocationResponse } from "./types/structs/structs/query";
import { QueryAllGridRequest } from "./types/structs/structs/query";
import { QueryAllStructRequest } from "./types/structs/structs/query";
import { StructAttributeRecord } from "./types/structs/structs/struct";
import { EventPlanetAttribute } from "./types/structs/structs/events";
import { EventOreMine } from "./types/structs/structs/events";
import { EventAttackShotDetail } from "./types/structs/structs/events";
import { MsgStructStealthDeactivate } from "./types/structs/structs/tx";
import { StructAttributes } from "./types/structs/structs/struct";
import { EventStruct } from "./types/structs/structs/events";
import { MsgGuildUpdateResponse } from "./types/structs/structs/tx";
import { MsgProviderGuildRevoke } from "./types/structs/structs/tx";
import { MsgProviderDelete } from "./types/structs/structs/tx";
import { Agreement } from "./types/structs/structs/agreement";
import { EventGuildBankConfiscateAndBurnDetail } from "./types/structs/structs/events";
import { EventGuildMembershipApplication } from "./types/structs/structs/events";
import { MsgGuildMembershipJoin } from "./types/structs/structs/tx";
import { MsgPlanetExplore } from "./types/structs/structs/tx";
import { MsgStructStorageStash } from "./types/structs/structs/tx";
import { MsgSubstationAllocationConnectResponse } from "./types/structs/structs/tx";
import { MsgPermissionRevokeOnObject } from "./types/structs/structs/tx";
import { MsgReactorCancelDefusion } from "./types/structs/structs/tx";
import { MsgSubstationAllocationConnect } from "./types/structs/structs/tx";
import { QueryGetPlanetRequest } from "./types/structs/structs/query";
import { StructType } from "./types/structs/structs/struct";
import { MsgGuildMembershipResponse } from "./types/structs/structs/tx";
import { MsgReactorInfuse } from "./types/structs/structs/tx";
import { MsgStructBuildCompleteAndStash } from "./types/structs/structs/tx";
import { AddressAssociation } from "./types/structs/structs/address";
import { EventAddressAssociation } from "./types/structs/structs/events";
import { MsgReactorCancelDefusionResponse } from "./types/structs/structs/tx";
import { AddressRecord } from "./types/structs/structs/address";
import { StructDefenders } from "./types/structs/structs/struct";
import { EventPlanet } from "./types/structs/structs/events";
import { MsgGuildUpdateEntrySubstationId } from "./types/structs/structs/tx";
import { AddressActivity } from "./types/structs/structs/address";
import { EventAlphaInfuse } from "./types/structs/structs/events";
import { MsgUpdateParamsResponse } from "./types/structs/structs/tx";
import { MsgStructOreRefineryComplete } from "./types/structs/structs/tx";
import { QueryAllPlayerHaltedRequest } from "./types/structs/structs/query";
import { EventAlphaDefuse } from "./types/structs/structs/events";
import { QueryAllAddressResponse } from "./types/structs/structs/query";
import { QueryGetPermissionResponse } from "./types/structs/structs/query";
import { QueryGetPlanetAttributeRequest } from "./types/structs/structs/query";
import { EventPermission } from "./types/structs/structs/events";
import { EventOreTheftDetail } from "./types/structs/structs/events";
import { QueryGetPlanetResponse } from "./types/structs/structs/query";
import { Infusion } from "./types/structs/structs/infusion";
import { MsgGuildCreate } from "./types/structs/structs/tx";
import { MsgGuildMembershipRequest } from "./types/structs/structs/tx";
import { MsgPlayerUpdatePrimaryAddressResponse } from "./types/structs/structs/tx";
import { MsgAgreementClose } from "./types/structs/structs/tx";
import { QueryGetAgreementResponse } from "./types/structs/structs/query";
import { EventOreMigrate } from "./types/structs/structs/events";
import { MsgGuildCreateResponse } from "./types/structs/structs/tx";
import { MsgProviderGuildGrant } from "./types/structs/structs/tx";
import { QueryAddressResponse } from "./types/structs/structs/query";
import { MsgGuildMembershipRequestDeny } from "./types/structs/structs/tx";
import { MsgStructDeactivate } from "./types/structs/structs/tx";
import { MsgProviderResponse } from "./types/structs/structs/tx";
import { QueryAllPlanetResponse } from "./types/structs/structs/query";
import { QueryAllProviderResponse } from "./types/structs/structs/query";
import { EventAlphaInfuseDetail } from "./types/structs/structs/events";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/structs.structs.MsgFleetMoveResponse", MsgFleetMoveResponse],
    ["/structs.structs.MsgPermissionSetOnObject", MsgPermissionSetOnObject],
    ["/structs.structs.EventGuild", EventGuild],
    ["/structs.structs.EventOreTheft", EventOreTheft],
    ["/structs.structs.MsgStructMove", MsgStructMove],
    ["/structs.structs.MsgStructOreMinerComplete", MsgStructOreMinerComplete],
    ["/structs.structs.QueryAllAddressByPlayerRequest", QueryAllAddressByPlayerRequest],
    ["/structs.structs.EventOreMigrateDetail", EventOreMigrateDetail],
    ["/structs.structs.MsgGuildBankRedeemResponse", MsgGuildBankRedeemResponse],
    ["/structs.structs.MsgStructBuildComplete", MsgStructBuildComplete],
    ["/structs.structs.MsgStructDefenseSet", MsgStructDefenseSet],
    ["/structs.structs.MsgProviderUpdateAccessPolicy", MsgProviderUpdateAccessPolicy],
    ["/structs.structs.QueryAllFleetRequest", QueryAllFleetRequest],
    ["/structs.structs.MsgAllocationCreate", MsgAllocationCreate],
    ["/structs.structs.MsgPermissionResponse", MsgPermissionResponse],
    ["/structs.structs.QueryParamsRequest", QueryParamsRequest],
    ["/structs.structs.QueryAllFleetResponse", QueryAllFleetResponse],
    ["/structs.structs.PlayerInventory", PlayerInventory],
    ["/structs.structs.EventProviderGrantGuildDetail", EventProviderGrantGuildDetail],
    ["/structs.structs.EventGuildBankMintDetail", EventGuildBankMintDetail],
    ["/structs.structs.MsgSubstationCreateResponse", MsgSubstationCreateResponse],
    ["/structs.structs.MsgSubstationPlayerMigrateResponse", MsgSubstationPlayerMigrateResponse],
    ["/structs.structs.MsgProviderUpdateCapacityMinimum", MsgProviderUpdateCapacityMinimum],
    ["/structs.structs.QueryGetGuildMembershipApplicationResponse", QueryGetGuildMembershipApplicationResponse],
    ["/structs.structs.QueryGetPlayerResponse", QueryGetPlayerResponse],
    ["/structs.structs.QueryGetSubstationResponse", QueryGetSubstationResponse],
    ["/structs.structs.StructDefender", StructDefender],
    ["/structs.structs.MsgReactorDefuseResponse", MsgReactorDefuseResponse],
    ["/structs.structs.MsgStructAttack", MsgStructAttack],
    ["/structs.structs.EventTime", EventTime],
    ["/structs.structs.MsgSubstationDelete", MsgSubstationDelete],
    ["/structs.structs.Guild", Guild],
    ["/structs.structs.QueryGetProviderRequest", QueryGetProviderRequest],
    ["/structs.structs.MsgAllocationUpdate", MsgAllocationUpdate],
    ["/structs.structs.MsgSubstationPlayerDisconnectResponse", MsgSubstationPlayerDisconnectResponse],
    ["/structs.structs.EventAlphaRefineDetail", EventAlphaRefineDetail],
    ["/structs.structs.MsgAllocationDeleteResponse", MsgAllocationDeleteResponse],
    ["/structs.structs.MsgGuildMembershipInviteRevoke", MsgGuildMembershipInviteRevoke],
    ["/structs.structs.MsgProviderUpdateDurationMinimum", MsgProviderUpdateDurationMinimum],
    ["/structs.structs.InternalAddressAssociation", InternalAddressAssociation],
    ["/structs.structs.Params", Params],
    ["/structs.structs.PermissionRecord", PermissionRecord],
    ["/structs.structs.EventReactor", EventReactor],
    ["/structs.structs.EventStructAttribute", EventStructAttribute],
    ["/structs.structs.MsgAddressRevoke", MsgAddressRevoke],
    ["/structs.structs.MsgSubstationPlayerConnectResponse", MsgSubstationPlayerConnectResponse],
    ["/structs.structs.QueryGetFleetRequest", QueryGetFleetRequest],
    ["/structs.structs.QueryGetInfusionResponse", QueryGetInfusionResponse],
    ["/structs.structs.QueryGetStructTypeRequest", QueryGetStructTypeRequest],
    ["/structs.structs.EventAttackDefenderCounterDetail", EventAttackDefenderCounterDetail],
    ["/structs.structs.MsgStructGeneratorInfuse", MsgStructGeneratorInfuse],
    ["/structs.structs.QueryAllPlayerHaltedResponse", QueryAllPlayerHaltedResponse],
    ["/structs.structs.EventProviderRevokeGuildDetail", EventProviderRevokeGuildDetail],
    ["/structs.structs.PlanetAttributeRecord", PlanetAttributeRecord],
    ["/structs.structs.MsgPlanetExploreResponse", MsgPlanetExploreResponse],
    ["/structs.structs.QueryGetStructTypeResponse", QueryGetStructTypeResponse],
    ["/structs.structs.EventInfusion", EventInfusion],
    ["/structs.structs.PlanetAttributes", PlanetAttributes],
    ["/structs.structs.MsgStructOreRefineryStatusResponse", MsgStructOreRefineryStatusResponse],
    ["/structs.structs.QueryAllAgreementByProviderRequest", QueryAllAgreementByProviderRequest],
    ["/structs.structs.QueryAllGuildResponse", QueryAllGuildResponse],
    ["/structs.structs.QueryGetGuildMembershipApplicationRequest", QueryGetGuildMembershipApplicationRequest],
    ["/structs.structs.QueryGetProviderByCollateralAddressRequest", QueryGetProviderByCollateralAddressRequest],
    ["/structs.structs.EventGuildBankAddressDetail", EventGuildBankAddressDetail],
    ["/structs.structs.MsgGuildUpdateJoinInfusionMinimumBypassByRequest", MsgGuildUpdateJoinInfusionMinimumBypassByRequest],
    ["/structs.structs.MsgPermissionRevokeOnAddress", MsgPermissionRevokeOnAddress],
    ["/structs.structs.QueryParamsResponse", QueryParamsResponse],
    ["/structs.structs.QueryAllPlanetRequest", QueryAllPlanetRequest],
    ["/structs.structs.QueryAllPlayerResponse", QueryAllPlayerResponse],
    ["/structs.structs.MsgAddressRevokeResponse", MsgAddressRevokeResponse],
    ["/structs.structs.MsgStructActivate", MsgStructActivate],
    ["/structs.structs.MsgStructGeneratorStatusResponse", MsgStructGeneratorStatusResponse],
    ["/structs.structs.MsgAgreementCapacityIncrease", MsgAgreementCapacityIncrease],
    ["/structs.structs.QueryGetGuildByBankCollateralAddressRequest", QueryGetGuildByBankCollateralAddressRequest],
    ["/structs.structs.QueryValidateSignatureRequest", QueryValidateSignatureRequest],
    ["/structs.structs.MsgPlanetRaidComplete", MsgPlanetRaidComplete],
    ["/structs.structs.QueryAllAgreementRequest", QueryAllAgreementRequest],
    ["/structs.structs.QueryAllStructResponse", QueryAllStructResponse],
    ["/structs.structs.QueryAllSubstationResponse", QueryAllSubstationResponse],
    ["/structs.structs.EventPlayerResumed", EventPlayerResumed],
    ["/structs.structs.QueryAllGuildBankCollateralAddressRequest", QueryAllGuildBankCollateralAddressRequest],
    ["/structs.structs.EventStructDefender", EventStructDefender],
    ["/structs.structs.EventAttackDetail", EventAttackDetail],
    ["/structs.structs.MsgAddressRegister", MsgAddressRegister],
    ["/structs.structs.MsgGuildMembershipRequestApprove", MsgGuildMembershipRequestApprove],
    ["/structs.structs.MsgStructOreMinerStatusResponse", MsgStructOreMinerStatusResponse],
    ["/structs.structs.QueryAllAllocationRequest", QueryAllAllocationRequest],
    ["/structs.structs.QueryAllAllocationBySourceRequest", QueryAllAllocationBySourceRequest],
    ["/structs.structs.GridAttributes", GridAttributes],
    ["/structs.structs.StructsPacketData", StructsPacketData],
    ["/structs.structs.EventSubstation", EventSubstation],
    ["/structs.structs.MsgFleetMove", MsgFleetMove],
    ["/structs.structs.MsgGuildBankRedeem", MsgGuildBankRedeem],
    ["/structs.structs.QueryGetFleetByIndexRequest", QueryGetFleetByIndexRequest],
    ["/structs.structs.QueryGetGridResponse", QueryGetGridResponse],
    ["/structs.structs.QueryGetInfusionRequest", QueryGetInfusionRequest],
    ["/structs.structs.QueryAllInfusionResponse", QueryAllInfusionResponse],
    ["/structs.structs.EventProviderAddressDetail", EventProviderAddressDetail],
    ["/structs.structs.MsgGuildUpdateEndpoint", MsgGuildUpdateEndpoint],
    ["/structs.structs.MsgAgreementDurationIncrease", MsgAgreementDurationIncrease],
    ["/structs.structs.QueryAllAllocationResponse", QueryAllAllocationResponse],
    ["/structs.structs.QueryAllReactorResponse", QueryAllReactorResponse],
    ["/structs.structs.EventStructType", EventStructType],
    ["/structs.structs.EventGrid", EventGrid],
    ["/structs.structs.EventGuildBankRedeem", EventGuildBankRedeem],
    ["/structs.structs.EventOreMineDetail", EventOreMineDetail],
    ["/structs.structs.QueryAllAllocationByDestinationRequest", QueryAllAllocationByDestinationRequest],
    ["/structs.structs.Player", Player],
    ["/structs.structs.MsgPlayerResumeResponse", MsgPlayerResumeResponse],
    ["/structs.structs.MsgStructStatusResponse", MsgStructStatusResponse],
    ["/structs.structs.MsgStructStorageRecall", MsgStructStorageRecall],
    ["/structs.structs.MsgAgreementResponse", MsgAgreementResponse],
    ["/structs.structs.MsgProviderCreate", MsgProviderCreate],
    ["/structs.structs.MsgPlayerSendResponse", MsgPlayerSendResponse],
    ["/structs.structs.QueryAllAddressRequest", QueryAllAddressRequest],
    ["/structs.structs.QueryGetReactorResponse", QueryGetReactorResponse],
    ["/structs.structs.EventProviderGrantGuild", EventProviderGrantGuild],
    ["/structs.structs.EventGuildBankConfiscateAndBurn", EventGuildBankConfiscateAndBurn],
    ["/structs.structs.QueryBlockHeightResponse", QueryBlockHeightResponse],
    ["/structs.structs.QueryAllPlanetByPlayerRequest", QueryAllPlanetByPlayerRequest],
    ["/structs.structs.MsgGuildMembershipRequestRevoke", MsgGuildMembershipRequestRevoke],
    ["/structs.structs.QueryAllStructAttributeRequest", QueryAllStructAttributeRequest],
    ["/structs.structs.Reactor", Reactor],
    ["/structs.structs.EventAttack", EventAttack],
    ["/structs.structs.MsgSubstationAllocationDisconnectResponse", MsgSubstationAllocationDisconnectResponse],
    ["/structs.structs.MsgAgreementCapacityDecrease", MsgAgreementCapacityDecrease],
    ["/structs.structs.QueryAllGuildBankCollateralAddressResponse", QueryAllGuildBankCollateralAddressResponse],
    ["/structs.structs.QueryAllSubstationRequest", QueryAllSubstationRequest],
    ["/structs.structs.QueryValidateSignatureResponse", QueryValidateSignatureResponse],
    ["/structs.structs.EventFleet", EventFleet],
    ["/structs.structs.Provider", Provider],
    ["/structs.structs.QueryBlockHeight", QueryBlockHeight],
    ["/structs.structs.QueryGetReactorRequest", QueryGetReactorRequest],
    ["/structs.structs.GridRecord", GridRecord],
    ["/structs.structs.MsgGuildUpdateJoinInfusionMinimumBypassByInvite", MsgGuildUpdateJoinInfusionMinimumBypassByInvite],
    ["/structs.structs.MsgReactorInfuseResponse", MsgReactorInfuseResponse],
    ["/structs.structs.MsgStructBuildCancel", MsgStructBuildCancel],
    ["/structs.structs.Substation", Substation],
    ["/structs.structs.MsgGuildUpdateOwnerId", MsgGuildUpdateOwnerId],
    ["/structs.structs.MsgGuildMembershipInviteDeny", MsgGuildMembershipInviteDeny],
    ["/structs.structs.MsgSubstationDeleteResponse", MsgSubstationDeleteResponse],
    ["/structs.structs.Fleet", Fleet],
    ["/structs.structs.QueryAllPlanetAttributeRequest", QueryAllPlanetAttributeRequest],
    ["/structs.structs.QueryAllReactorRequest", QueryAllReactorRequest],
    ["/structs.structs.EventProvider", EventProvider],
    ["/structs.structs.EventGuildBankRedeemDetail", EventGuildBankRedeemDetail],
    ["/structs.structs.MsgPlayerResume", MsgPlayerResume],
    ["/structs.structs.MsgProviderWithdrawBalance", MsgProviderWithdrawBalance],
    ["/structs.structs.MsgProviderUpdateDurationMaximum", MsgProviderUpdateDurationMaximum],
    ["/structs.structs.QueryAllInfusionRequest", QueryAllInfusionRequest],
    ["/structs.structs.QueryGetProviderResponse", QueryGetProviderResponse],
    ["/structs.structs.QueryAllProviderCollateralAddressResponse", QueryAllProviderCollateralAddressResponse],
    ["/structs.structs.NoData", NoData],
    ["/structs.structs.MsgReactorBeginMigration", MsgReactorBeginMigration],
    ["/structs.structs.MsgReactorBeginMigrationResponse", MsgReactorBeginMigrationResponse],
    ["/structs.structs.MsgSubstationPlayerDisconnect", MsgSubstationPlayerDisconnect],
    ["/structs.structs.GuildMembershipApplication", GuildMembershipApplication],
    ["/structs.structs.QueryGetAllocationRequest", QueryGetAllocationRequest],
    ["/structs.structs.EventAgreement", EventAgreement],
    ["/structs.structs.MsgAllocationDelete", MsgAllocationDelete],
    ["/structs.structs.MsgAgreementOpen", MsgAgreementOpen],
    ["/structs.structs.MsgPlayerSend", MsgPlayerSend],
    ["/structs.structs.QueryGetGuildRequest", QueryGetGuildRequest],
    ["/structs.structs.Planet", Planet],
    ["/structs.structs.MsgAllocationTransferResponse", MsgAllocationTransferResponse],
    ["/structs.structs.MsgStructDefenseClear", MsgStructDefenseClear],
    ["/structs.structs.QueryAllAgreementResponse", QueryAllAgreementResponse],
    ["/structs.structs.QueryAllPermissionByObjectRequest", QueryAllPermissionByObjectRequest],
    ["/structs.structs.QueryAllStructAttributeResponse", QueryAllStructAttributeResponse],
    ["/structs.structs.EventAlphaDefuseDetail", EventAlphaDefuseDetail],
    ["/structs.structs.MsgGuildMembershipJoinProxy", MsgGuildMembershipJoinProxy],
    ["/structs.structs.MsgStructBuildInitiate", MsgStructBuildInitiate],
    ["/structs.structs.GenesisState", GenesisState],
    ["/structs.structs.QueryGetFleetResponse", QueryGetFleetResponse],
    ["/structs.structs.QueryAllGuildRequest", QueryAllGuildRequest],
    ["/structs.structs.QueryGetPlanetAttributeResponse", QueryGetPlanetAttributeResponse],
    ["/structs.structs.MsgGuildBankMintResponse", MsgGuildBankMintResponse],
    ["/structs.structs.MsgGuildBankConfiscateAndBurn", MsgGuildBankConfiscateAndBurn],
    ["/structs.structs.MsgSubstationPlayerConnect", MsgSubstationPlayerConnect],
    ["/structs.structs.QueryAllGuildMembershipApplicationResponse", QueryAllGuildMembershipApplicationResponse],
    ["/structs.structs.QueryAllProviderRequest", QueryAllProviderRequest],
    ["/structs.structs.QueryGetProviderByEarningsAddressRequest", QueryGetProviderByEarningsAddressRequest],
    ["/structs.structs.EventPlayer", EventPlayer],
    ["/structs.structs.EventProviderRevokeGuild", EventProviderRevokeGuild],
    ["/structs.structs.MsgAddressRegisterResponse", MsgAddressRegisterResponse],
    ["/structs.structs.MsgPermissionGrantOnObject", MsgPermissionGrantOnObject],
    ["/structs.structs.QueryGetPlayerRequest", QueryGetPlayerRequest],
    ["/structs.structs.QueryAllStructTypeResponse", QueryAllStructTypeResponse],
    ["/structs.structs.MsgPlanetRaidCompleteResponse", MsgPlanetRaidCompleteResponse],
    ["/structs.structs.MsgReactorDefuse", MsgReactorDefuse],
    ["/structs.structs.MsgStructStealthActivate", MsgStructStealthActivate],
    ["/structs.structs.QueryGetGuildBankCollateralAddressRequest", QueryGetGuildBankCollateralAddressRequest],
    ["/structs.structs.QueryAllGuildMembershipApplicationRequest", QueryAllGuildMembershipApplicationRequest],
    ["/structs.structs.QueryAllPermissionRequest", QueryAllPermissionRequest],
    ["/structs.structs.QueryAllProviderEarningsAddressResponse", QueryAllProviderEarningsAddressResponse],
    ["/structs.structs.Struct", Struct],
    ["/structs.structs.EventProviderAddress", EventProviderAddress],
    ["/structs.structs.MsgSubstationAllocationDisconnect", MsgSubstationAllocationDisconnect],
    ["/structs.structs.QueryGetAddressRequest", QueryGetAddressRequest],
    ["/structs.structs.EventPlayerHalted", EventPlayerHalted],
    ["/structs.structs.MsgUpdateParams", MsgUpdateParams],
    ["/structs.structs.MsgGuildBankMint", MsgGuildBankMint],
    ["/structs.structs.MsgGuildUpdateJoinInfusionMinimum", MsgGuildUpdateJoinInfusionMinimum],
    ["/structs.structs.QueryAllPermissionResponse", QueryAllPermissionResponse],
    ["/structs.structs.EventAllocation", EventAllocation],
    ["/structs.structs.EventTimeDetail", EventTimeDetail],
    ["/structs.structs.MsgPlayerUpdatePrimaryAddress", MsgPlayerUpdatePrimaryAddress],
    ["/structs.structs.QueryGetAgreementRequest", QueryGetAgreementRequest],
    ["/structs.structs.MsgPermissionGrantOnAddress", MsgPermissionGrantOnAddress],
    ["/structs.structs.MsgPermissionSetOnAddress", MsgPermissionSetOnAddress],
    ["/structs.structs.EventAddressActivity", EventAddressActivity],
    ["/structs.structs.EventRaid", EventRaid],
    ["/structs.structs.MsgAllocationUpdateResponse", MsgAllocationUpdateResponse],
    ["/structs.structs.MsgStructAttackResponse", MsgStructAttackResponse],
    ["/structs.structs.MsgSubstationCreate", MsgSubstationCreate],
    ["/structs.structs.QueryAllPlanetAttributeResponse", QueryAllPlanetAttributeResponse],
    ["/structs.structs.QueryAllProviderEarningsAddressRequest", QueryAllProviderEarningsAddressRequest],
    ["/structs.structs.QueryAllPlayerRequest", QueryAllPlayerRequest],
    ["/structs.structs.QueryGetStructAttributeRequest", QueryGetStructAttributeRequest],
    ["/structs.structs.EventGuildBankAddress", EventGuildBankAddress],
    ["/structs.structs.MsgAllocationCreateResponse", MsgAllocationCreateResponse],
    ["/structs.structs.Allocation", Allocation],
    ["/structs.structs.QueryAllPermissionByPlayerRequest", QueryAllPermissionByPlayerRequest],
    ["/structs.structs.QueryAllProviderCollateralAddressRequest", QueryAllProviderCollateralAddressRequest],
    ["/structs.structs.QueryGetProviderEarningsAddressRequest", QueryGetProviderEarningsAddressRequest],
    ["/structs.structs.MsgAllocationTransfer", MsgAllocationTransfer],
    ["/structs.structs.MsgGuildBankConfiscateAndBurnResponse", MsgGuildBankConfiscateAndBurnResponse],
    ["/structs.structs.MsgGuildMembershipKick", MsgGuildMembershipKick],
    ["/structs.structs.QueryAllGridResponse", QueryAllGridResponse],
    ["/structs.structs.FleetAttributeRecord", FleetAttributeRecord],
    ["/structs.structs.MsgSubstationPlayerMigrate", MsgSubstationPlayerMigrate],
    ["/structs.structs.MsgProviderUpdateCapacityMaximum", MsgProviderUpdateCapacityMaximum],
    ["/structs.structs.EventDelete", EventDelete],
    ["/structs.structs.EventGuildBankMint", EventGuildBankMint],
    ["/structs.structs.QueryGetGridRequest", QueryGetGridRequest],
    ["/structs.structs.QueryGetGuildResponse", QueryGetGuildResponse],
    ["/structs.structs.QueryGetProviderCollateralAddressRequest", QueryGetProviderCollateralAddressRequest],
    ["/structs.structs.QueryGetStructRequest", QueryGetStructRequest],
    ["/structs.structs.QueryGetStructAttributeResponse", QueryGetStructAttributeResponse],
    ["/structs.structs.QueryAllStructTypeRequest", QueryAllStructTypeRequest],
    ["/structs.structs.EventAlphaRefine", EventAlphaRefine],
    ["/structs.structs.QueryAllInfusionByDestinationRequest", QueryAllInfusionByDestinationRequest],
    ["/structs.structs.QueryGetPermissionRequest", QueryGetPermissionRequest],
    ["/structs.structs.QueryGetStructResponse", QueryGetStructResponse],
    ["/structs.structs.QueryGetSubstationRequest", QueryGetSubstationRequest],
    ["/structs.structs.EventRaidDetail", EventRaidDetail],
    ["/structs.structs.MsgGuildMembershipInvite", MsgGuildMembershipInvite],
    ["/structs.structs.MsgGuildMembershipInviteApprove", MsgGuildMembershipInviteApprove],
    ["/structs.structs.QueryGetAllocationResponse", QueryGetAllocationResponse],
    ["/structs.structs.QueryAllGridRequest", QueryAllGridRequest],
    ["/structs.structs.QueryAllStructRequest", QueryAllStructRequest],
    ["/structs.structs.StructAttributeRecord", StructAttributeRecord],
    ["/structs.structs.EventPlanetAttribute", EventPlanetAttribute],
    ["/structs.structs.EventOreMine", EventOreMine],
    ["/structs.structs.EventAttackShotDetail", EventAttackShotDetail],
    ["/structs.structs.MsgStructStealthDeactivate", MsgStructStealthDeactivate],
    ["/structs.structs.StructAttributes", StructAttributes],
    ["/structs.structs.EventStruct", EventStruct],
    ["/structs.structs.MsgGuildUpdateResponse", MsgGuildUpdateResponse],
    ["/structs.structs.MsgProviderGuildRevoke", MsgProviderGuildRevoke],
    ["/structs.structs.MsgProviderDelete", MsgProviderDelete],
    ["/structs.structs.Agreement", Agreement],
    ["/structs.structs.EventGuildBankConfiscateAndBurnDetail", EventGuildBankConfiscateAndBurnDetail],
    ["/structs.structs.EventGuildMembershipApplication", EventGuildMembershipApplication],
    ["/structs.structs.MsgGuildMembershipJoin", MsgGuildMembershipJoin],
    ["/structs.structs.MsgPlanetExplore", MsgPlanetExplore],
    ["/structs.structs.MsgStructStorageStash", MsgStructStorageStash],
    ["/structs.structs.MsgSubstationAllocationConnectResponse", MsgSubstationAllocationConnectResponse],
    ["/structs.structs.MsgPermissionRevokeOnObject", MsgPermissionRevokeOnObject],
    ["/structs.structs.MsgReactorCancelDefusion", MsgReactorCancelDefusion],
    ["/structs.structs.MsgSubstationAllocationConnect", MsgSubstationAllocationConnect],
    ["/structs.structs.QueryGetPlanetRequest", QueryGetPlanetRequest],
    ["/structs.structs.StructType", StructType],
    ["/structs.structs.MsgGuildMembershipResponse", MsgGuildMembershipResponse],
    ["/structs.structs.MsgReactorInfuse", MsgReactorInfuse],
    ["/structs.structs.MsgStructBuildCompleteAndStash", MsgStructBuildCompleteAndStash],
    ["/structs.structs.AddressAssociation", AddressAssociation],
    ["/structs.structs.EventAddressAssociation", EventAddressAssociation],
    ["/structs.structs.MsgReactorCancelDefusionResponse", MsgReactorCancelDefusionResponse],
    ["/structs.structs.AddressRecord", AddressRecord],
    ["/structs.structs.StructDefenders", StructDefenders],
    ["/structs.structs.EventPlanet", EventPlanet],
    ["/structs.structs.MsgGuildUpdateEntrySubstationId", MsgGuildUpdateEntrySubstationId],
    ["/structs.structs.AddressActivity", AddressActivity],
    ["/structs.structs.EventAlphaInfuse", EventAlphaInfuse],
    ["/structs.structs.MsgUpdateParamsResponse", MsgUpdateParamsResponse],
    ["/structs.structs.MsgStructOreRefineryComplete", MsgStructOreRefineryComplete],
    ["/structs.structs.QueryAllPlayerHaltedRequest", QueryAllPlayerHaltedRequest],
    ["/structs.structs.EventAlphaDefuse", EventAlphaDefuse],
    ["/structs.structs.QueryAllAddressResponse", QueryAllAddressResponse],
    ["/structs.structs.QueryGetPermissionResponse", QueryGetPermissionResponse],
    ["/structs.structs.QueryGetPlanetAttributeRequest", QueryGetPlanetAttributeRequest],
    ["/structs.structs.EventPermission", EventPermission],
    ["/structs.structs.EventOreTheftDetail", EventOreTheftDetail],
    ["/structs.structs.QueryGetPlanetResponse", QueryGetPlanetResponse],
    ["/structs.structs.Infusion", Infusion],
    ["/structs.structs.MsgGuildCreate", MsgGuildCreate],
    ["/structs.structs.MsgGuildMembershipRequest", MsgGuildMembershipRequest],
    ["/structs.structs.MsgPlayerUpdatePrimaryAddressResponse", MsgPlayerUpdatePrimaryAddressResponse],
    ["/structs.structs.MsgAgreementClose", MsgAgreementClose],
    ["/structs.structs.QueryGetAgreementResponse", QueryGetAgreementResponse],
    ["/structs.structs.EventOreMigrate", EventOreMigrate],
    ["/structs.structs.MsgGuildCreateResponse", MsgGuildCreateResponse],
    ["/structs.structs.MsgProviderGuildGrant", MsgProviderGuildGrant],
    ["/structs.structs.QueryAddressResponse", QueryAddressResponse],
    ["/structs.structs.MsgGuildMembershipRequestDeny", MsgGuildMembershipRequestDeny],
    ["/structs.structs.MsgStructDeactivate", MsgStructDeactivate],
    ["/structs.structs.MsgProviderResponse", MsgProviderResponse],
    ["/structs.structs.QueryAllPlanetResponse", QueryAllPlanetResponse],
    ["/structs.structs.QueryAllProviderResponse", QueryAllProviderResponse],
    ["/structs.structs.EventAlphaInfuseDetail", EventAlphaInfuseDetail],
    
];

export { msgTypes }