import { GeneratedType } from "@cosmjs/proto-signing";
import { QueryAllAgreementByProviderRequest } from "./types/structs/structs/query";
import { QueryAllInfusionRequest } from "./types/structs/structs/query";
import { MsgGuildMembershipInviteApprove } from "./types/structs/structs/tx";
import { EventAgreement } from "./types/structs/structs/events";
import { StructAttributes } from "./types/structs/structs/struct";
import { QueryGetPermissionRequest } from "./types/structs/structs/query";
import { QueryGetProviderResponse } from "./types/structs/structs/query";
import { MsgFleetMove } from "./types/structs/structs/tx";
import { MsgStructBuildInitiate } from "./types/structs/structs/tx";
import { MsgSubstationPlayerMigrateResponse } from "./types/structs/structs/tx";
import { MsgAgreementResponse } from "./types/structs/structs/tx";
import { EventGuildBankAddressDetail } from "./types/structs/structs/events";
import { EventOreMineDetail } from "./types/structs/structs/events";
import { QueryGetAllocationResponse } from "./types/structs/structs/query";
import { Provider } from "./types/structs/structs/provider";
import { MsgAllocationCreateResponse } from "./types/structs/structs/tx";
import { MsgGuildUpdateEntrySubstationId } from "./types/structs/structs/tx";
import { MsgGuildMembershipKick } from "./types/structs/structs/tx";
import { QueryGetFleetByIndexRequest } from "./types/structs/structs/query";
import { QueryGetPlanetResponse } from "./types/structs/structs/query";
import { QueryGetPlanetAttributeResponse } from "./types/structs/structs/query";
import { QueryGetProviderCollateralAddressRequest } from "./types/structs/structs/query";
import { MsgUpdateParams } from "./types/structs/structs/tx";
import { PlanetAttributeRecord } from "./types/structs/structs/planet";
import { PlanetAttributes } from "./types/structs/structs/planet";
import { MsgGuildMembershipRequestApprove } from "./types/structs/structs/tx";
import { MsgStructOreRefineryStatusResponse } from "./types/structs/structs/tx";
import { EventAllocation } from "./types/structs/structs/events";
import { EventPlayerResumed } from "./types/structs/structs/events";
import { QueryBlockHeightResponse } from "./types/structs/structs/query";
import { MsgPlayerUpdatePrimaryAddress } from "./types/structs/structs/tx";
import { EventGuildBankConfiscateAndBurnDetail } from "./types/structs/structs/events";
import { EventAttackShotDetail } from "./types/structs/structs/events";
import { QueryGetStructAttributeRequest } from "./types/structs/structs/query";
import { MsgReactorInfuseResponse } from "./types/structs/structs/tx";
import { MsgReactorBeginMigrationResponse } from "./types/structs/structs/tx";
import { MsgStructOreMinerComplete } from "./types/structs/structs/tx";
import { QueryAllStructAttributeRequest } from "./types/structs/structs/query";
import { NoData } from "./types/structs/structs/packet";
import { EventGuildMembershipApplication } from "./types/structs/structs/events";
import { QueryGetAgreementRequest } from "./types/structs/structs/query";
import { QueryAllAgreementResponse } from "./types/structs/structs/query";
import { MsgAllocationCreate } from "./types/structs/structs/tx";
import { MsgReactorCancelDefusion } from "./types/structs/structs/tx";
import { EventFleet } from "./types/structs/structs/events";
import { EventPlanetAttribute } from "./types/structs/structs/events";
import { StructType } from "./types/structs/structs/struct";
import { Infusion } from "./types/structs/structs/infusion";
import { QueryGetGuildBankCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryAllPermissionByObjectRequest } from "./types/structs/structs/query";
import { MsgPlanetRaidComplete } from "./types/structs/structs/tx";
import { MsgPlayerResume } from "./types/structs/structs/tx";
import { QueryGetPlanetRequest } from "./types/structs/structs/query";
import { QueryGetProviderEarningsAddressRequest } from "./types/structs/structs/query";
import { QueryAllStructAttributeResponse } from "./types/structs/structs/query";
import { MsgStructStorageStash } from "./types/structs/structs/tx";
import { MsgStructStorageRecall } from "./types/structs/structs/tx";
import { EventStructAttribute } from "./types/structs/structs/events";
import { EventGuildBankMint } from "./types/structs/structs/events";
import { EventOreMigrate } from "./types/structs/structs/events";
import { AddressAssociation } from "./types/structs/structs/address";
import { PlayerInventory } from "./types/structs/structs/player";
import { QueryAllAllocationResponse } from "./types/structs/structs/query";
import { QueryAllGuildBankCollateralAddressResponse } from "./types/structs/structs/query";
import { QueryAllProviderCollateralAddressResponse } from "./types/structs/structs/query";
import { MsgSubstationAllocationDisconnect } from "./types/structs/structs/tx";
import { MsgStructDefenseSet } from "./types/structs/structs/tx";
import { MsgStructOreRefineryComplete } from "./types/structs/structs/tx";
import { EventTime } from "./types/structs/structs/events";
import { AddressActivity } from "./types/structs/structs/address";
import { QueryAllGuildMembershipApplicationRequest } from "./types/structs/structs/query";
import { QueryGetStructRequest } from "./types/structs/structs/query";
import { MsgAgreementCapacityIncrease } from "./types/structs/structs/tx";
import { MsgStructBuildCompleteAndStash } from "./types/structs/structs/tx";
import { MsgStructGeneratorInfuse } from "./types/structs/structs/tx";
import { EventDelete } from "./types/structs/structs/events";
import { QueryGetPlanetAttributeRequest } from "./types/structs/structs/query";
import { MsgAllocationUpdateResponse } from "./types/structs/structs/tx";
import { Agreement } from "./types/structs/structs/agreement";
import { QueryGetGridResponse } from "./types/structs/structs/query";
import { QueryGetInfusionResponse } from "./types/structs/structs/query";
import { MsgUpdateParamsResponse } from "./types/structs/structs/tx";
import { MsgReactorInfuse } from "./types/structs/structs/tx";
import { EventProviderRevokeGuildDetail } from "./types/structs/structs/events";
import { Guild } from "./types/structs/structs/guild";
import { MsgPermissionGrantOnObject } from "./types/structs/structs/tx";
import { MsgSubstationPlayerConnect } from "./types/structs/structs/tx";
import { EventPlayer } from "./types/structs/structs/events";
import { EventAlphaDefuseDetail } from "./types/structs/structs/events";
import { PermissionRecord } from "./types/structs/structs/permission";
import { MsgStructBuildComplete } from "./types/structs/structs/tx";
import { MsgGuildUpdateJoinInfusionMinimum } from "./types/structs/structs/tx";
import { MsgGuildMembershipRequestDeny } from "./types/structs/structs/tx";
import { GenesisState } from "./types/structs/structs/genesis";
import { MsgGuildUpdateJoinInfusionMinimumBypassByRequest } from "./types/structs/structs/tx";
import { MsgPermissionRevokeOnAddress } from "./types/structs/structs/tx";
import { MsgAgreementClose } from "./types/structs/structs/tx";
import { MsgAgreementCapacityDecrease } from "./types/structs/structs/tx";
import { EventProviderRevokeGuild } from "./types/structs/structs/events";
import { EventGuildBankMintDetail } from "./types/structs/structs/events";
import { MsgAddressRegisterResponse } from "./types/structs/structs/tx";
import { InternalAddressAssociation } from "./types/structs/structs/address";
import { QueryAllAgreementRequest } from "./types/structs/structs/query";
import { QueryAllGuildBankCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryGetReactorRequest } from "./types/structs/structs/query";
import { QueryGetReactorResponse } from "./types/structs/structs/query";
import { QueryAllReactorResponse } from "./types/structs/structs/query";
import { QueryAllSubstationRequest } from "./types/structs/structs/query";
import { MsgSubstationAllocationConnect } from "./types/structs/structs/tx";
import { EventInfusion } from "./types/structs/structs/events";
import { EventOreTheftDetail } from "./types/structs/structs/events";
import { QueryGetGuildByBankCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryAllPermissionByPlayerRequest } from "./types/structs/structs/query";
import { MsgStructDefenseClear } from "./types/structs/structs/tx";
import { QueryAllStructResponse } from "./types/structs/structs/query";
import { QueryValidateSignatureResponse } from "./types/structs/structs/query";
import { MsgGuildBankRedeemResponse } from "./types/structs/structs/tx";
import { MsgStructMove } from "./types/structs/structs/tx";
import { MsgSubstationAllocationConnectResponse } from "./types/structs/structs/tx";
import { MsgProviderWithdrawBalance } from "./types/structs/structs/tx";
import { QueryAllProviderEarningsAddressResponse } from "./types/structs/structs/query";
import { MsgPlanetExplore } from "./types/structs/structs/tx";
import { MsgStructStealthDeactivate } from "./types/structs/structs/tx";
import { QueryAllPlayerRequest } from "./types/structs/structs/query";
import { QueryAllProviderResponse } from "./types/structs/structs/query";
import { QueryGetStructTypeResponse } from "./types/structs/structs/query";
import { MsgStructGeneratorStatusResponse } from "./types/structs/structs/tx";
import { EventProviderAddress } from "./types/structs/structs/events";
import { MsgAddressRevoke } from "./types/structs/structs/tx";
import { MsgReactorCancelDefusionResponse } from "./types/structs/structs/tx";
import { MsgProviderGuildGrant } from "./types/structs/structs/tx";
import { QueryParamsResponse } from "./types/structs/structs/query";
import { QueryGetAgreementResponse } from "./types/structs/structs/query";
import { QueryAllFleetRequest } from "./types/structs/structs/query";
import { QueryAllPlayerHaltedRequest } from "./types/structs/structs/query";
import { EventGuildBankAddress } from "./types/structs/structs/events";
import { Player } from "./types/structs/structs/player";
import { QueryAllGridRequest } from "./types/structs/structs/query";
import { MsgSubstationCreate } from "./types/structs/structs/tx";
import { MsgPermissionSetOnObject } from "./types/structs/structs/tx";
import { MsgPlanetRaidCompleteResponse } from "./types/structs/structs/tx";
import { MsgStructDeactivate } from "./types/structs/structs/tx";
import { EventGuildBankRedeem } from "./types/structs/structs/events";
import { QueryGetAllocationRequest } from "./types/structs/structs/query";
import { QueryGetFleetRequest } from "./types/structs/structs/query";
import { QueryAllGridResponse } from "./types/structs/structs/query";
import { MsgSubstationPlayerDisconnectResponse } from "./types/structs/structs/tx";
import { MsgSubstationDeleteResponse } from "./types/structs/structs/tx";
import { EventProviderGrantGuildDetail } from "./types/structs/structs/events";
import { AddressRecord } from "./types/structs/structs/address";
import { QueryAllGuildResponse } from "./types/structs/structs/query";
import { MsgGuildMembershipJoinProxy } from "./types/structs/structs/tx";
import { EventProviderAddressDetail } from "./types/structs/structs/events";
import { EventAddressActivity } from "./types/structs/structs/events";
import { QueryAllPlanetByPlayerRequest } from "./types/structs/structs/query";
import { MsgGuildMembershipInviteDeny } from "./types/structs/structs/tx";
import { MsgProviderUpdateDurationMaximum } from "./types/structs/structs/tx";
import { EventStruct } from "./types/structs/structs/events";
import { QueryGetSubstationResponse } from "./types/structs/structs/query";
import { MsgGuildBankMintResponse } from "./types/structs/structs/tx";
import { MsgProviderUpdateAccessPolicy } from "./types/structs/structs/tx";
import { EventPlanet } from "./types/structs/structs/events";
import { QueryGetGridRequest } from "./types/structs/structs/query";
import { QueryAllProviderRequest } from "./types/structs/structs/query";
import { QueryAllProviderEarningsAddressRequest } from "./types/structs/structs/query";
import { QueryValidateSignatureRequest } from "./types/structs/structs/query";
import { MsgAllocationTransferResponse } from "./types/structs/structs/tx";
import { QueryAllPlanetRequest } from "./types/structs/structs/query";
import { MsgProviderGuildRevoke } from "./types/structs/structs/tx";
import { StructDefenders } from "./types/structs/structs/struct";
import { QueryAllAllocationBySourceRequest } from "./types/structs/structs/query";
import { QueryGetFleetResponse } from "./types/structs/structs/query";
import { MsgGuildBankRedeem } from "./types/structs/structs/tx";
import { MsgPlanetExploreResponse } from "./types/structs/structs/tx";
import { QueryAllPlanetResponse } from "./types/structs/structs/query";
import { MsgGuildUpdateResponse } from "./types/structs/structs/tx";
import { MsgPlayerUpdatePrimaryAddressResponse } from "./types/structs/structs/tx";
import { EventAddressAssociation } from "./types/structs/structs/events";
import { EventOreMigrateDetail } from "./types/structs/structs/events";
import { QueryGetGuildMembershipApplicationRequest } from "./types/structs/structs/query";
import { QueryAllPlanetAttributeRequest } from "./types/structs/structs/query";
import { QueryAllStructTypeResponse } from "./types/structs/structs/query";
import { MsgGuildMembershipRequest } from "./types/structs/structs/tx";
import { MsgSubstationPlayerMigrate } from "./types/structs/structs/tx";
import { QueryGetProviderByCollateralAddressRequest } from "./types/structs/structs/query";
import { QueryGetStructResponse } from "./types/structs/structs/query";
import { QueryGetInfusionRequest } from "./types/structs/structs/query";
import { QueryGetPermissionResponse } from "./types/structs/structs/query";
import { QueryAllProviderCollateralAddressRequest } from "./types/structs/structs/query";
import { MsgReactorDefuseResponse } from "./types/structs/structs/tx";
import { MsgAgreementDurationIncrease } from "./types/structs/structs/tx";
import { EventOreMine } from "./types/structs/structs/events";
import { QueryGetAddressRequest } from "./types/structs/structs/query";
import { FleetAttributeRecord } from "./types/structs/structs/fleet";
import { MsgStructStealthActivate } from "./types/structs/structs/tx";
import { MsgProviderUpdateCapacityMaximum } from "./types/structs/structs/tx";
import { GridAttributes } from "./types/structs/structs/grid";
import { QueryGetPlayerRequest } from "./types/structs/structs/query";
import { QueryGetProviderByEarningsAddressRequest } from "./types/structs/structs/query";
import { MsgStructAttack } from "./types/structs/structs/tx";
import { MsgProviderUpdateCapacityMinimum } from "./types/structs/structs/tx";
import { EventGuildBankConfiscateAndBurn } from "./types/structs/structs/events";
import { EventAttackDetail } from "./types/structs/structs/events";
import { QueryAddressResponse } from "./types/structs/structs/query";
import { QueryAllStructRequest } from "./types/structs/structs/query";
import { StructDefender } from "./types/structs/structs/struct";
import { MsgGuildMembershipJoin } from "./types/structs/structs/tx";
import { MsgPlayerResumeResponse } from "./types/structs/structs/tx";
import { MsgAgreementOpen } from "./types/structs/structs/tx";
import { StructsPacketData } from "./types/structs/structs/packet";
import { EventAttack } from "./types/structs/structs/events";
import { GuildMembershipApplication } from "./types/structs/structs/guild";
import { Params } from "./types/structs/structs/params";
import { MsgPermissionGrantOnAddress } from "./types/structs/structs/tx";
import { MsgAllocationTransfer } from "./types/structs/structs/tx";
import { MsgPermissionResponse } from "./types/structs/structs/tx";
import { QueryAllAddressResponse } from "./types/structs/structs/query";
import { QueryAllInfusionByDestinationRequest } from "./types/structs/structs/query";
import { QueryAllPlayerResponse } from "./types/structs/structs/query";
import { MsgGuildMembershipInviteRevoke } from "./types/structs/structs/tx";
import { MsgPermissionRevokeOnObject } from "./types/structs/structs/tx";
import { MsgStructBuildCancel } from "./types/structs/structs/tx";
import { EventRaidDetail } from "./types/structs/structs/events";
import { Allocation } from "./types/structs/structs/allocation";
import { MsgGuildBankConfiscateAndBurnResponse } from "./types/structs/structs/tx";
import { MsgStructActivate } from "./types/structs/structs/tx";
import { MsgProviderUpdateDurationMinimum } from "./types/structs/structs/tx";
import { EventPermission } from "./types/structs/structs/events";
import { QueryAllPlayerHaltedResponse } from "./types/structs/structs/query";
import { QueryGetStructAttributeResponse } from "./types/structs/structs/query";
import { QueryGetStructTypeRequest } from "./types/structs/structs/query";
import { MsgAllocationDeleteResponse } from "./types/structs/structs/tx";
import { MsgGuildMembershipResponse } from "./types/structs/structs/tx";
import { MsgProviderDelete } from "./types/structs/structs/tx";
import { EventAttackDefenderCounterDetail } from "./types/structs/structs/events";
import { QueryAllAddressRequest } from "./types/structs/structs/query";
import { MsgAddressRegister } from "./types/structs/structs/tx";
import { MsgStructStatusResponse } from "./types/structs/structs/tx";
import { MsgStructAttackResponse } from "./types/structs/structs/tx";
import { EventOreTheft } from "./types/structs/structs/events";
import { QueryAllInfusionResponse } from "./types/structs/structs/query";
import { EventGrid } from "./types/structs/structs/events";
import { QueryAllStructTypeRequest } from "./types/structs/structs/query";
import { MsgProviderCreate } from "./types/structs/structs/tx";
import { MsgFleetMoveResponse } from "./types/structs/structs/tx";
import { MsgSubstationCreateResponse } from "./types/structs/structs/tx";
import { EventSubstation } from "./types/structs/structs/events";
import { EventAlphaInfuseDetail } from "./types/structs/structs/events";
import { QueryAllGuildMembershipApplicationResponse } from "./types/structs/structs/query";
import { QueryAllReactorRequest } from "./types/structs/structs/query";
import { MsgReactorDefuse } from "./types/structs/structs/tx";
import { StructAttributeRecord } from "./types/structs/structs/struct";
import { QueryParamsRequest } from "./types/structs/structs/query";
import { QueryAllAllocationByDestinationRequest } from "./types/structs/structs/query";
import { QueryAllFleetResponse } from "./types/structs/structs/query";
import { QueryAllPlanetAttributeResponse } from "./types/structs/structs/query";
import { QueryGetProviderRequest } from "./types/structs/structs/query";
import { MsgReactorBeginMigration } from "./types/structs/structs/tx";
import { Fleet } from "./types/structs/structs/fleet";
import { MsgGuildBankMint } from "./types/structs/structs/tx";
import { EventProvider } from "./types/structs/structs/events";
import { EventStructType } from "./types/structs/structs/events";
import { EventPlayerHalted } from "./types/structs/structs/events";
import { QueryGetGuildMembershipApplicationResponse } from "./types/structs/structs/query";
import { QueryAllSubstationResponse } from "./types/structs/structs/query";
import { MsgAddressRevokeResponse } from "./types/structs/structs/tx";
import { MsgStructOreMinerStatusResponse } from "./types/structs/structs/tx";
import { EventGuild } from "./types/structs/structs/events";
import { MsgGuildUpdateJoinInfusionMinimumBypassByInvite } from "./types/structs/structs/tx";
import { MsgPermissionSetOnAddress } from "./types/structs/structs/tx";
import { MsgSubstationAllocationDisconnectResponse } from "./types/structs/structs/tx";
import { EventStructDefender } from "./types/structs/structs/events";
import { EventTimeDetail } from "./types/structs/structs/events";
import { EventAlphaRefineDetail } from "./types/structs/structs/events";
import { QueryAllAddressByPlayerRequest } from "./types/structs/structs/query";
import { QueryGetGuildRequest } from "./types/structs/structs/query";
import { MsgAllocationUpdate } from "./types/structs/structs/tx";
import { EventProviderGrantGuild } from "./types/structs/structs/events";
import { EventAlphaRefine } from "./types/structs/structs/events";
import { QueryAllPermissionRequest } from "./types/structs/structs/query";
import { QueryAllPermissionResponse } from "./types/structs/structs/query";
import { Planet } from "./types/structs/structs/planet";
import { MsgGuildBankConfiscateAndBurn } from "./types/structs/structs/tx";
import { MsgSubstationDelete } from "./types/structs/structs/tx";
import { MsgSubstationPlayerConnectResponse } from "./types/structs/structs/tx";
import { EventAlphaDefuse } from "./types/structs/structs/events";
import { Struct } from "./types/structs/structs/struct";
import { QueryGetPlayerResponse } from "./types/structs/structs/query";
import { EventGuildBankRedeemDetail } from "./types/structs/structs/events";
import { EventRaid } from "./types/structs/structs/events";
import { MsgSubstationPlayerDisconnect } from "./types/structs/structs/tx";
import { MsgAllocationDelete } from "./types/structs/structs/tx";
import { MsgGuildCreate } from "./types/structs/structs/tx";
import { MsgGuildCreateResponse } from "./types/structs/structs/tx";
import { MsgGuildUpdateOwnerId } from "./types/structs/structs/tx";
import { MsgGuildMembershipInvite } from "./types/structs/structs/tx";
import { EventReactor } from "./types/structs/structs/events";
import { MsgGuildMembershipRequestRevoke } from "./types/structs/structs/tx";
import { MsgProviderResponse } from "./types/structs/structs/tx";
import { QueryAllAllocationRequest } from "./types/structs/structs/query";
import { QueryGetGuildResponse } from "./types/structs/structs/query";
import { QueryAllGuildRequest } from "./types/structs/structs/query";
import { MsgGuildUpdateEndpoint } from "./types/structs/structs/tx";
import { Substation } from "./types/structs/structs/substation";
import { QueryBlockHeight } from "./types/structs/structs/query";
import { QueryGetSubstationRequest } from "./types/structs/structs/query";
import { EventAlphaInfuse } from "./types/structs/structs/events";
import { GridRecord } from "./types/structs/structs/grid";
import { Reactor } from "./types/structs/structs/reactor";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/structs.structs.QueryAllAgreementByProviderRequest", QueryAllAgreementByProviderRequest],
    ["/structs.structs.QueryAllInfusionRequest", QueryAllInfusionRequest],
    ["/structs.structs.MsgGuildMembershipInviteApprove", MsgGuildMembershipInviteApprove],
    ["/structs.structs.EventAgreement", EventAgreement],
    ["/structs.structs.StructAttributes", StructAttributes],
    ["/structs.structs.QueryGetPermissionRequest", QueryGetPermissionRequest],
    ["/structs.structs.QueryGetProviderResponse", QueryGetProviderResponse],
    ["/structs.structs.MsgFleetMove", MsgFleetMove],
    ["/structs.structs.MsgStructBuildInitiate", MsgStructBuildInitiate],
    ["/structs.structs.MsgSubstationPlayerMigrateResponse", MsgSubstationPlayerMigrateResponse],
    ["/structs.structs.MsgAgreementResponse", MsgAgreementResponse],
    ["/structs.structs.EventGuildBankAddressDetail", EventGuildBankAddressDetail],
    ["/structs.structs.EventOreMineDetail", EventOreMineDetail],
    ["/structs.structs.QueryGetAllocationResponse", QueryGetAllocationResponse],
    ["/structs.structs.Provider", Provider],
    ["/structs.structs.MsgAllocationCreateResponse", MsgAllocationCreateResponse],
    ["/structs.structs.MsgGuildUpdateEntrySubstationId", MsgGuildUpdateEntrySubstationId],
    ["/structs.structs.MsgGuildMembershipKick", MsgGuildMembershipKick],
    ["/structs.structs.QueryGetFleetByIndexRequest", QueryGetFleetByIndexRequest],
    ["/structs.structs.QueryGetPlanetResponse", QueryGetPlanetResponse],
    ["/structs.structs.QueryGetPlanetAttributeResponse", QueryGetPlanetAttributeResponse],
    ["/structs.structs.QueryGetProviderCollateralAddressRequest", QueryGetProviderCollateralAddressRequest],
    ["/structs.structs.MsgUpdateParams", MsgUpdateParams],
    ["/structs.structs.PlanetAttributeRecord", PlanetAttributeRecord],
    ["/structs.structs.PlanetAttributes", PlanetAttributes],
    ["/structs.structs.MsgGuildMembershipRequestApprove", MsgGuildMembershipRequestApprove],
    ["/structs.structs.MsgStructOreRefineryStatusResponse", MsgStructOreRefineryStatusResponse],
    ["/structs.structs.EventAllocation", EventAllocation],
    ["/structs.structs.EventPlayerResumed", EventPlayerResumed],
    ["/structs.structs.QueryBlockHeightResponse", QueryBlockHeightResponse],
    ["/structs.structs.MsgPlayerUpdatePrimaryAddress", MsgPlayerUpdatePrimaryAddress],
    ["/structs.structs.EventGuildBankConfiscateAndBurnDetail", EventGuildBankConfiscateAndBurnDetail],
    ["/structs.structs.EventAttackShotDetail", EventAttackShotDetail],
    ["/structs.structs.QueryGetStructAttributeRequest", QueryGetStructAttributeRequest],
    ["/structs.structs.MsgReactorInfuseResponse", MsgReactorInfuseResponse],
    ["/structs.structs.MsgReactorBeginMigrationResponse", MsgReactorBeginMigrationResponse],
    ["/structs.structs.MsgStructOreMinerComplete", MsgStructOreMinerComplete],
    ["/structs.structs.QueryAllStructAttributeRequest", QueryAllStructAttributeRequest],
    ["/structs.structs.NoData", NoData],
    ["/structs.structs.EventGuildMembershipApplication", EventGuildMembershipApplication],
    ["/structs.structs.QueryGetAgreementRequest", QueryGetAgreementRequest],
    ["/structs.structs.QueryAllAgreementResponse", QueryAllAgreementResponse],
    ["/structs.structs.MsgAllocationCreate", MsgAllocationCreate],
    ["/structs.structs.MsgReactorCancelDefusion", MsgReactorCancelDefusion],
    ["/structs.structs.EventFleet", EventFleet],
    ["/structs.structs.EventPlanetAttribute", EventPlanetAttribute],
    ["/structs.structs.StructType", StructType],
    ["/structs.structs.Infusion", Infusion],
    ["/structs.structs.QueryGetGuildBankCollateralAddressRequest", QueryGetGuildBankCollateralAddressRequest],
    ["/structs.structs.QueryAllPermissionByObjectRequest", QueryAllPermissionByObjectRequest],
    ["/structs.structs.MsgPlanetRaidComplete", MsgPlanetRaidComplete],
    ["/structs.structs.MsgPlayerResume", MsgPlayerResume],
    ["/structs.structs.QueryGetPlanetRequest", QueryGetPlanetRequest],
    ["/structs.structs.QueryGetProviderEarningsAddressRequest", QueryGetProviderEarningsAddressRequest],
    ["/structs.structs.QueryAllStructAttributeResponse", QueryAllStructAttributeResponse],
    ["/structs.structs.MsgStructStorageStash", MsgStructStorageStash],
    ["/structs.structs.MsgStructStorageRecall", MsgStructStorageRecall],
    ["/structs.structs.EventStructAttribute", EventStructAttribute],
    ["/structs.structs.EventGuildBankMint", EventGuildBankMint],
    ["/structs.structs.EventOreMigrate", EventOreMigrate],
    ["/structs.structs.AddressAssociation", AddressAssociation],
    ["/structs.structs.PlayerInventory", PlayerInventory],
    ["/structs.structs.QueryAllAllocationResponse", QueryAllAllocationResponse],
    ["/structs.structs.QueryAllGuildBankCollateralAddressResponse", QueryAllGuildBankCollateralAddressResponse],
    ["/structs.structs.QueryAllProviderCollateralAddressResponse", QueryAllProviderCollateralAddressResponse],
    ["/structs.structs.MsgSubstationAllocationDisconnect", MsgSubstationAllocationDisconnect],
    ["/structs.structs.MsgStructDefenseSet", MsgStructDefenseSet],
    ["/structs.structs.MsgStructOreRefineryComplete", MsgStructOreRefineryComplete],
    ["/structs.structs.EventTime", EventTime],
    ["/structs.structs.AddressActivity", AddressActivity],
    ["/structs.structs.QueryAllGuildMembershipApplicationRequest", QueryAllGuildMembershipApplicationRequest],
    ["/structs.structs.QueryGetStructRequest", QueryGetStructRequest],
    ["/structs.structs.MsgAgreementCapacityIncrease", MsgAgreementCapacityIncrease],
    ["/structs.structs.MsgStructBuildCompleteAndStash", MsgStructBuildCompleteAndStash],
    ["/structs.structs.MsgStructGeneratorInfuse", MsgStructGeneratorInfuse],
    ["/structs.structs.EventDelete", EventDelete],
    ["/structs.structs.QueryGetPlanetAttributeRequest", QueryGetPlanetAttributeRequest],
    ["/structs.structs.MsgAllocationUpdateResponse", MsgAllocationUpdateResponse],
    ["/structs.structs.Agreement", Agreement],
    ["/structs.structs.QueryGetGridResponse", QueryGetGridResponse],
    ["/structs.structs.QueryGetInfusionResponse", QueryGetInfusionResponse],
    ["/structs.structs.MsgUpdateParamsResponse", MsgUpdateParamsResponse],
    ["/structs.structs.MsgReactorInfuse", MsgReactorInfuse],
    ["/structs.structs.EventProviderRevokeGuildDetail", EventProviderRevokeGuildDetail],
    ["/structs.structs.Guild", Guild],
    ["/structs.structs.MsgPermissionGrantOnObject", MsgPermissionGrantOnObject],
    ["/structs.structs.MsgSubstationPlayerConnect", MsgSubstationPlayerConnect],
    ["/structs.structs.EventPlayer", EventPlayer],
    ["/structs.structs.EventAlphaDefuseDetail", EventAlphaDefuseDetail],
    ["/structs.structs.PermissionRecord", PermissionRecord],
    ["/structs.structs.MsgStructBuildComplete", MsgStructBuildComplete],
    ["/structs.structs.MsgGuildUpdateJoinInfusionMinimum", MsgGuildUpdateJoinInfusionMinimum],
    ["/structs.structs.MsgGuildMembershipRequestDeny", MsgGuildMembershipRequestDeny],
    ["/structs.structs.GenesisState", GenesisState],
    ["/structs.structs.MsgGuildUpdateJoinInfusionMinimumBypassByRequest", MsgGuildUpdateJoinInfusionMinimumBypassByRequest],
    ["/structs.structs.MsgPermissionRevokeOnAddress", MsgPermissionRevokeOnAddress],
    ["/structs.structs.MsgAgreementClose", MsgAgreementClose],
    ["/structs.structs.MsgAgreementCapacityDecrease", MsgAgreementCapacityDecrease],
    ["/structs.structs.EventProviderRevokeGuild", EventProviderRevokeGuild],
    ["/structs.structs.EventGuildBankMintDetail", EventGuildBankMintDetail],
    ["/structs.structs.MsgAddressRegisterResponse", MsgAddressRegisterResponse],
    ["/structs.structs.InternalAddressAssociation", InternalAddressAssociation],
    ["/structs.structs.QueryAllAgreementRequest", QueryAllAgreementRequest],
    ["/structs.structs.QueryAllGuildBankCollateralAddressRequest", QueryAllGuildBankCollateralAddressRequest],
    ["/structs.structs.QueryGetReactorRequest", QueryGetReactorRequest],
    ["/structs.structs.QueryGetReactorResponse", QueryGetReactorResponse],
    ["/structs.structs.QueryAllReactorResponse", QueryAllReactorResponse],
    ["/structs.structs.QueryAllSubstationRequest", QueryAllSubstationRequest],
    ["/structs.structs.MsgSubstationAllocationConnect", MsgSubstationAllocationConnect],
    ["/structs.structs.EventInfusion", EventInfusion],
    ["/structs.structs.EventOreTheftDetail", EventOreTheftDetail],
    ["/structs.structs.QueryGetGuildByBankCollateralAddressRequest", QueryGetGuildByBankCollateralAddressRequest],
    ["/structs.structs.QueryAllPermissionByPlayerRequest", QueryAllPermissionByPlayerRequest],
    ["/structs.structs.MsgStructDefenseClear", MsgStructDefenseClear],
    ["/structs.structs.QueryAllStructResponse", QueryAllStructResponse],
    ["/structs.structs.QueryValidateSignatureResponse", QueryValidateSignatureResponse],
    ["/structs.structs.MsgGuildBankRedeemResponse", MsgGuildBankRedeemResponse],
    ["/structs.structs.MsgStructMove", MsgStructMove],
    ["/structs.structs.MsgSubstationAllocationConnectResponse", MsgSubstationAllocationConnectResponse],
    ["/structs.structs.MsgProviderWithdrawBalance", MsgProviderWithdrawBalance],
    ["/structs.structs.QueryAllProviderEarningsAddressResponse", QueryAllProviderEarningsAddressResponse],
    ["/structs.structs.MsgPlanetExplore", MsgPlanetExplore],
    ["/structs.structs.MsgStructStealthDeactivate", MsgStructStealthDeactivate],
    ["/structs.structs.QueryAllPlayerRequest", QueryAllPlayerRequest],
    ["/structs.structs.QueryAllProviderResponse", QueryAllProviderResponse],
    ["/structs.structs.QueryGetStructTypeResponse", QueryGetStructTypeResponse],
    ["/structs.structs.MsgStructGeneratorStatusResponse", MsgStructGeneratorStatusResponse],
    ["/structs.structs.EventProviderAddress", EventProviderAddress],
    ["/structs.structs.MsgAddressRevoke", MsgAddressRevoke],
    ["/structs.structs.MsgReactorCancelDefusionResponse", MsgReactorCancelDefusionResponse],
    ["/structs.structs.MsgProviderGuildGrant", MsgProviderGuildGrant],
    ["/structs.structs.QueryParamsResponse", QueryParamsResponse],
    ["/structs.structs.QueryGetAgreementResponse", QueryGetAgreementResponse],
    ["/structs.structs.QueryAllFleetRequest", QueryAllFleetRequest],
    ["/structs.structs.QueryAllPlayerHaltedRequest", QueryAllPlayerHaltedRequest],
    ["/structs.structs.EventGuildBankAddress", EventGuildBankAddress],
    ["/structs.structs.Player", Player],
    ["/structs.structs.QueryAllGridRequest", QueryAllGridRequest],
    ["/structs.structs.MsgSubstationCreate", MsgSubstationCreate],
    ["/structs.structs.MsgPermissionSetOnObject", MsgPermissionSetOnObject],
    ["/structs.structs.MsgPlanetRaidCompleteResponse", MsgPlanetRaidCompleteResponse],
    ["/structs.structs.MsgStructDeactivate", MsgStructDeactivate],
    ["/structs.structs.EventGuildBankRedeem", EventGuildBankRedeem],
    ["/structs.structs.QueryGetAllocationRequest", QueryGetAllocationRequest],
    ["/structs.structs.QueryGetFleetRequest", QueryGetFleetRequest],
    ["/structs.structs.QueryAllGridResponse", QueryAllGridResponse],
    ["/structs.structs.MsgSubstationPlayerDisconnectResponse", MsgSubstationPlayerDisconnectResponse],
    ["/structs.structs.MsgSubstationDeleteResponse", MsgSubstationDeleteResponse],
    ["/structs.structs.EventProviderGrantGuildDetail", EventProviderGrantGuildDetail],
    ["/structs.structs.AddressRecord", AddressRecord],
    ["/structs.structs.QueryAllGuildResponse", QueryAllGuildResponse],
    ["/structs.structs.MsgGuildMembershipJoinProxy", MsgGuildMembershipJoinProxy],
    ["/structs.structs.EventProviderAddressDetail", EventProviderAddressDetail],
    ["/structs.structs.EventAddressActivity", EventAddressActivity],
    ["/structs.structs.QueryAllPlanetByPlayerRequest", QueryAllPlanetByPlayerRequest],
    ["/structs.structs.MsgGuildMembershipInviteDeny", MsgGuildMembershipInviteDeny],
    ["/structs.structs.MsgProviderUpdateDurationMaximum", MsgProviderUpdateDurationMaximum],
    ["/structs.structs.EventStruct", EventStruct],
    ["/structs.structs.QueryGetSubstationResponse", QueryGetSubstationResponse],
    ["/structs.structs.MsgGuildBankMintResponse", MsgGuildBankMintResponse],
    ["/structs.structs.MsgProviderUpdateAccessPolicy", MsgProviderUpdateAccessPolicy],
    ["/structs.structs.EventPlanet", EventPlanet],
    ["/structs.structs.QueryGetGridRequest", QueryGetGridRequest],
    ["/structs.structs.QueryAllProviderRequest", QueryAllProviderRequest],
    ["/structs.structs.QueryAllProviderEarningsAddressRequest", QueryAllProviderEarningsAddressRequest],
    ["/structs.structs.QueryValidateSignatureRequest", QueryValidateSignatureRequest],
    ["/structs.structs.MsgAllocationTransferResponse", MsgAllocationTransferResponse],
    ["/structs.structs.QueryAllPlanetRequest", QueryAllPlanetRequest],
    ["/structs.structs.MsgProviderGuildRevoke", MsgProviderGuildRevoke],
    ["/structs.structs.StructDefenders", StructDefenders],
    ["/structs.structs.QueryAllAllocationBySourceRequest", QueryAllAllocationBySourceRequest],
    ["/structs.structs.QueryGetFleetResponse", QueryGetFleetResponse],
    ["/structs.structs.MsgGuildBankRedeem", MsgGuildBankRedeem],
    ["/structs.structs.MsgPlanetExploreResponse", MsgPlanetExploreResponse],
    ["/structs.structs.QueryAllPlanetResponse", QueryAllPlanetResponse],
    ["/structs.structs.MsgGuildUpdateResponse", MsgGuildUpdateResponse],
    ["/structs.structs.MsgPlayerUpdatePrimaryAddressResponse", MsgPlayerUpdatePrimaryAddressResponse],
    ["/structs.structs.EventAddressAssociation", EventAddressAssociation],
    ["/structs.structs.EventOreMigrateDetail", EventOreMigrateDetail],
    ["/structs.structs.QueryGetGuildMembershipApplicationRequest", QueryGetGuildMembershipApplicationRequest],
    ["/structs.structs.QueryAllPlanetAttributeRequest", QueryAllPlanetAttributeRequest],
    ["/structs.structs.QueryAllStructTypeResponse", QueryAllStructTypeResponse],
    ["/structs.structs.MsgGuildMembershipRequest", MsgGuildMembershipRequest],
    ["/structs.structs.MsgSubstationPlayerMigrate", MsgSubstationPlayerMigrate],
    ["/structs.structs.QueryGetProviderByCollateralAddressRequest", QueryGetProviderByCollateralAddressRequest],
    ["/structs.structs.QueryGetStructResponse", QueryGetStructResponse],
    ["/structs.structs.QueryGetInfusionRequest", QueryGetInfusionRequest],
    ["/structs.structs.QueryGetPermissionResponse", QueryGetPermissionResponse],
    ["/structs.structs.QueryAllProviderCollateralAddressRequest", QueryAllProviderCollateralAddressRequest],
    ["/structs.structs.MsgReactorDefuseResponse", MsgReactorDefuseResponse],
    ["/structs.structs.MsgAgreementDurationIncrease", MsgAgreementDurationIncrease],
    ["/structs.structs.EventOreMine", EventOreMine],
    ["/structs.structs.QueryGetAddressRequest", QueryGetAddressRequest],
    ["/structs.structs.FleetAttributeRecord", FleetAttributeRecord],
    ["/structs.structs.MsgStructStealthActivate", MsgStructStealthActivate],
    ["/structs.structs.MsgProviderUpdateCapacityMaximum", MsgProviderUpdateCapacityMaximum],
    ["/structs.structs.GridAttributes", GridAttributes],
    ["/structs.structs.QueryGetPlayerRequest", QueryGetPlayerRequest],
    ["/structs.structs.QueryGetProviderByEarningsAddressRequest", QueryGetProviderByEarningsAddressRequest],
    ["/structs.structs.MsgStructAttack", MsgStructAttack],
    ["/structs.structs.MsgProviderUpdateCapacityMinimum", MsgProviderUpdateCapacityMinimum],
    ["/structs.structs.EventGuildBankConfiscateAndBurn", EventGuildBankConfiscateAndBurn],
    ["/structs.structs.EventAttackDetail", EventAttackDetail],
    ["/structs.structs.QueryAddressResponse", QueryAddressResponse],
    ["/structs.structs.QueryAllStructRequest", QueryAllStructRequest],
    ["/structs.structs.StructDefender", StructDefender],
    ["/structs.structs.MsgGuildMembershipJoin", MsgGuildMembershipJoin],
    ["/structs.structs.MsgPlayerResumeResponse", MsgPlayerResumeResponse],
    ["/structs.structs.MsgAgreementOpen", MsgAgreementOpen],
    ["/structs.structs.StructsPacketData", StructsPacketData],
    ["/structs.structs.EventAttack", EventAttack],
    ["/structs.structs.GuildMembershipApplication", GuildMembershipApplication],
    ["/structs.structs.Params", Params],
    ["/structs.structs.MsgPermissionGrantOnAddress", MsgPermissionGrantOnAddress],
    ["/structs.structs.MsgAllocationTransfer", MsgAllocationTransfer],
    ["/structs.structs.MsgPermissionResponse", MsgPermissionResponse],
    ["/structs.structs.QueryAllAddressResponse", QueryAllAddressResponse],
    ["/structs.structs.QueryAllInfusionByDestinationRequest", QueryAllInfusionByDestinationRequest],
    ["/structs.structs.QueryAllPlayerResponse", QueryAllPlayerResponse],
    ["/structs.structs.MsgGuildMembershipInviteRevoke", MsgGuildMembershipInviteRevoke],
    ["/structs.structs.MsgPermissionRevokeOnObject", MsgPermissionRevokeOnObject],
    ["/structs.structs.MsgStructBuildCancel", MsgStructBuildCancel],
    ["/structs.structs.EventRaidDetail", EventRaidDetail],
    ["/structs.structs.Allocation", Allocation],
    ["/structs.structs.MsgGuildBankConfiscateAndBurnResponse", MsgGuildBankConfiscateAndBurnResponse],
    ["/structs.structs.MsgStructActivate", MsgStructActivate],
    ["/structs.structs.MsgProviderUpdateDurationMinimum", MsgProviderUpdateDurationMinimum],
    ["/structs.structs.EventPermission", EventPermission],
    ["/structs.structs.QueryAllPlayerHaltedResponse", QueryAllPlayerHaltedResponse],
    ["/structs.structs.QueryGetStructAttributeResponse", QueryGetStructAttributeResponse],
    ["/structs.structs.QueryGetStructTypeRequest", QueryGetStructTypeRequest],
    ["/structs.structs.MsgAllocationDeleteResponse", MsgAllocationDeleteResponse],
    ["/structs.structs.MsgGuildMembershipResponse", MsgGuildMembershipResponse],
    ["/structs.structs.MsgProviderDelete", MsgProviderDelete],
    ["/structs.structs.EventAttackDefenderCounterDetail", EventAttackDefenderCounterDetail],
    ["/structs.structs.QueryAllAddressRequest", QueryAllAddressRequest],
    ["/structs.structs.MsgAddressRegister", MsgAddressRegister],
    ["/structs.structs.MsgStructStatusResponse", MsgStructStatusResponse],
    ["/structs.structs.MsgStructAttackResponse", MsgStructAttackResponse],
    ["/structs.structs.EventOreTheft", EventOreTheft],
    ["/structs.structs.QueryAllInfusionResponse", QueryAllInfusionResponse],
    ["/structs.structs.EventGrid", EventGrid],
    ["/structs.structs.QueryAllStructTypeRequest", QueryAllStructTypeRequest],
    ["/structs.structs.MsgProviderCreate", MsgProviderCreate],
    ["/structs.structs.MsgFleetMoveResponse", MsgFleetMoveResponse],
    ["/structs.structs.MsgSubstationCreateResponse", MsgSubstationCreateResponse],
    ["/structs.structs.EventSubstation", EventSubstation],
    ["/structs.structs.EventAlphaInfuseDetail", EventAlphaInfuseDetail],
    ["/structs.structs.QueryAllGuildMembershipApplicationResponse", QueryAllGuildMembershipApplicationResponse],
    ["/structs.structs.QueryAllReactorRequest", QueryAllReactorRequest],
    ["/structs.structs.MsgReactorDefuse", MsgReactorDefuse],
    ["/structs.structs.StructAttributeRecord", StructAttributeRecord],
    ["/structs.structs.QueryParamsRequest", QueryParamsRequest],
    ["/structs.structs.QueryAllAllocationByDestinationRequest", QueryAllAllocationByDestinationRequest],
    ["/structs.structs.QueryAllFleetResponse", QueryAllFleetResponse],
    ["/structs.structs.QueryAllPlanetAttributeResponse", QueryAllPlanetAttributeResponse],
    ["/structs.structs.QueryGetProviderRequest", QueryGetProviderRequest],
    ["/structs.structs.MsgReactorBeginMigration", MsgReactorBeginMigration],
    ["/structs.structs.Fleet", Fleet],
    ["/structs.structs.MsgGuildBankMint", MsgGuildBankMint],
    ["/structs.structs.EventProvider", EventProvider],
    ["/structs.structs.EventStructType", EventStructType],
    ["/structs.structs.EventPlayerHalted", EventPlayerHalted],
    ["/structs.structs.QueryGetGuildMembershipApplicationResponse", QueryGetGuildMembershipApplicationResponse],
    ["/structs.structs.QueryAllSubstationResponse", QueryAllSubstationResponse],
    ["/structs.structs.MsgAddressRevokeResponse", MsgAddressRevokeResponse],
    ["/structs.structs.MsgStructOreMinerStatusResponse", MsgStructOreMinerStatusResponse],
    ["/structs.structs.EventGuild", EventGuild],
    ["/structs.structs.MsgGuildUpdateJoinInfusionMinimumBypassByInvite", MsgGuildUpdateJoinInfusionMinimumBypassByInvite],
    ["/structs.structs.MsgPermissionSetOnAddress", MsgPermissionSetOnAddress],
    ["/structs.structs.MsgSubstationAllocationDisconnectResponse", MsgSubstationAllocationDisconnectResponse],
    ["/structs.structs.EventStructDefender", EventStructDefender],
    ["/structs.structs.EventTimeDetail", EventTimeDetail],
    ["/structs.structs.EventAlphaRefineDetail", EventAlphaRefineDetail],
    ["/structs.structs.QueryAllAddressByPlayerRequest", QueryAllAddressByPlayerRequest],
    ["/structs.structs.QueryGetGuildRequest", QueryGetGuildRequest],
    ["/structs.structs.MsgAllocationUpdate", MsgAllocationUpdate],
    ["/structs.structs.EventProviderGrantGuild", EventProviderGrantGuild],
    ["/structs.structs.EventAlphaRefine", EventAlphaRefine],
    ["/structs.structs.QueryAllPermissionRequest", QueryAllPermissionRequest],
    ["/structs.structs.QueryAllPermissionResponse", QueryAllPermissionResponse],
    ["/structs.structs.Planet", Planet],
    ["/structs.structs.MsgGuildBankConfiscateAndBurn", MsgGuildBankConfiscateAndBurn],
    ["/structs.structs.MsgSubstationDelete", MsgSubstationDelete],
    ["/structs.structs.MsgSubstationPlayerConnectResponse", MsgSubstationPlayerConnectResponse],
    ["/structs.structs.EventAlphaDefuse", EventAlphaDefuse],
    ["/structs.structs.Struct", Struct],
    ["/structs.structs.QueryGetPlayerResponse", QueryGetPlayerResponse],
    ["/structs.structs.EventGuildBankRedeemDetail", EventGuildBankRedeemDetail],
    ["/structs.structs.EventRaid", EventRaid],
    ["/structs.structs.MsgSubstationPlayerDisconnect", MsgSubstationPlayerDisconnect],
    ["/structs.structs.MsgAllocationDelete", MsgAllocationDelete],
    ["/structs.structs.MsgGuildCreate", MsgGuildCreate],
    ["/structs.structs.MsgGuildCreateResponse", MsgGuildCreateResponse],
    ["/structs.structs.MsgGuildUpdateOwnerId", MsgGuildUpdateOwnerId],
    ["/structs.structs.MsgGuildMembershipInvite", MsgGuildMembershipInvite],
    ["/structs.structs.EventReactor", EventReactor],
    ["/structs.structs.MsgGuildMembershipRequestRevoke", MsgGuildMembershipRequestRevoke],
    ["/structs.structs.MsgProviderResponse", MsgProviderResponse],
    ["/structs.structs.QueryAllAllocationRequest", QueryAllAllocationRequest],
    ["/structs.structs.QueryGetGuildResponse", QueryGetGuildResponse],
    ["/structs.structs.QueryAllGuildRequest", QueryAllGuildRequest],
    ["/structs.structs.MsgGuildUpdateEndpoint", MsgGuildUpdateEndpoint],
    ["/structs.structs.Substation", Substation],
    ["/structs.structs.QueryBlockHeight", QueryBlockHeight],
    ["/structs.structs.QueryGetSubstationRequest", QueryGetSubstationRequest],
    ["/structs.structs.EventAlphaInfuse", EventAlphaInfuse],
    ["/structs.structs.GridRecord", GridRecord],
    ["/structs.structs.Reactor", Reactor],
    
];

export { msgTypes }