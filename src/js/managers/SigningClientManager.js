import {Registry} from "@cosmjs/proto-signing";
import {defaultRegistryTypes, SigningStargateClient} from "@cosmjs/stargate";
// noinspection ES6PreferShortImport
import {msgTypes} from "../ts/structs.structs/registry";
import {
  MsgAddressRegister,
  MsgPlanetExplore,
  MsgPlanetRaidComplete,
  MsgAddressRevoke,
  MsgFleetMove,
  MsgAllocationCreate,
  MsgAllocationDelete,
  MsgAllocationUpdate,
  MsgAllocationTransfer,
  MsgGuildBankMint,
  MsgGuildBankRedeem,
  MsgGuildBankConfiscateAndBurn,
  MsgGuildUpdateEntrySubstationId,
  MsgGuildMembershipInvite,
  MsgGuildMembershipInviteApprove,
  MsgGuildMembershipInviteDeny,
  MsgGuildMembershipInviteRevoke,
  MsgGuildMembershipJoin,
  MsgGuildMembershipKick,
  MsgGuildMembershipRequest,
  MsgGuildMembershipRequestApprove,
  MsgGuildMembershipRequestDeny,
  MsgGuildMembershipRequestRevoke,
  MsgPermissionGrantOnObject,
  MsgPermissionGrantOnAddress,
  MsgPermissionRevokeOnObject,
  MsgPermissionRevokeOnAddress,
  MsgPermissionSetOnObject,
  MsgPermissionSetOnAddress,
  MsgPlayerUpdatePrimaryAddress,
  MsgPlayerResume,
  MsgStructActivate,
  MsgStructDeactivate,
  MsgStructBuildInitiate,
  MsgStructBuildCancel,
  MsgStructBuildComplete,
  MsgStructDefenseSet,
  MsgStructDefenseClear,
  MsgStructMove,
  MsgStructOreMinerComplete,
  MsgStructOreRefineryComplete,
  MsgStructAttack,
  MsgStructStealthActivate,
  MsgStructStealthDeactivate,
  MsgStructGeneratorInfuse,
  MsgSubstationCreate,
  MsgSubstationDelete,
  MsgSubstationAllocationConnect,
  MsgSubstationAllocationDisconnect,
  MsgSubstationPlayerConnect,
  MsgSubstationPlayerDisconnect,
  MsgSubstationPlayerMigrate,
  MsgAgreementOpen,
  MsgAgreementClose,
  MsgAgreementCapacityIncrease,
  MsgAgreementCapacityDecrease,
  MsgAgreementDurationIncrease,
  MsgProviderCreate,
  MsgProviderWithdrawBalance,
  MsgProviderUpdateCapacityMinimum,
  MsgProviderUpdateCapacityMaximum,
  MsgProviderUpdateDurationMinimum,
  MsgProviderUpdateDurationMaximum,
  MsgProviderUpdateAccessPolicy,
  MsgProviderGuildGrant,
  MsgProviderGuildRevoke,
  MsgProviderDelete
} from "../ts/structs.structs/types/structs/structs/tx";

export class SigningClientManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    this.gameState = gameState;
    this.wsUrl = `ws://${window.location.hostname}:26657`;
    this.registry = new Registry([...defaultRegistryTypes, ...msgTypes]);
  }

  /**
   * @param {DirectSecp256k1HdWallet} wallet
   * @return {Promise<void>}
   */
  async initSigningClient(wallet) {
    console.log("Initializing signing client...");
    this.gameState.signingClient = await SigningStargateClient.connectWithSigner(
      this.wsUrl,
      wallet,
      {
        registry: this.registry,
      },
    );
    console.log("Signing client initialized.");
  }

  /**
   * @param {string} playerAddress
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgPlanetExplore}}
   */
  createMsgPlanetExplore(playerAddress, playerId) {
    return {
      typeUrl: '/structs.structs.MsgPlanetExplore',
      value: MsgPlanetExplore.fromPartial({
        creator: playerAddress,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @param {string} addressToRegister
   * @param {string} proofPubKey
   * @param {string} proofSignature
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgAddressRegister}}
   */
  createMsgAddressRegister(creatorAddress, playerId, addressToRegister, proofPubKey, proofSignature, permissions) {
    return {
      typeUrl: '/structs.structs.MsgAddressRegister',
      value: MsgAddressRegister.fromPartial({
        creator: creatorAddress,
        playerId: playerId,
        address: addressToRegister,
        proofPubKey: proofPubKey,
        proofSignature: proofSignature,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} addressToRevoke
   * @return {{typeUrl: string, value: {creator: string, address: string}}}
   */
  createMsgAddressRevoke(creatorAddress, addressToRevoke) {
    return {
      typeUrl: '/structs.structs.MsgAddressRevoke',
      value: MsgAddressRevoke.fromPartial({
        creator: creatorAddress,
        address: addressToRevoke
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} fleetId
   * @param {string} destinationLocationId
   * @return {{typeUrl: string, value: MsgFleetMove}}
   */
  createMsgFleetMove(creatorAddress, fleetId, destinationLocationId) {
    return {
      typeUrl: '/structs.structs.MsgFleetMove',
      value: MsgFleetMove.fromPartial({
        creator: creatorAddress,
        fleetId: fleetId,
        destinationLocationId: destinationLocationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} fleetId
   * @param {string} proof
   * @param {string} nonce
   * @return {{typeUrl: string, value: MsgPlanetRaidComplete}}
   */
  createMsgPlanetRaidComplete(creatorAddress, fleetId, proof, nonce) {
    return {
      typeUrl: '/structs.structs.MsgPlanetRaidComplete',
      value: MsgPlanetRaidComplete.fromPartial({
        creator: creatorAddress,
        fleetId: fleetId,
        proof: proof,
        nonce: nonce
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   * @return {{typeUrl: string, value: MsgStructBuildComplete}}
   */
  createMsgStructBuildComplete(creatorAddress, structId, proof, nonce) {
    return {
      typeUrl: '/structs.structs.MsgStructBuildComplete',
      value: MsgStructBuildComplete.fromPartial({
        creator: creatorAddress,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   * @return {{typeUrl: string, value: MsgStructOreMinerComplete}}
   */
  createMsgStructOreMinerComplete(creatorAddress, structId, proof, nonce) {
    return {
      typeUrl: '/structs.structs.MsgStructOreMinerComplete',
      value: MsgStructOreMinerComplete.fromPartial({
        creator: creatorAddress,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   * @return {{typeUrl: string, value: MsgStructOreRefineryComplete}}
   */
  createMsgStructOreRefineryComplete(creatorAddress, structId, proof, nonce) {
    return {
      typeUrl: '/structs.structs.MsgStructOreRefineryComplete',
      value: MsgStructOreRefineryComplete.fromPartial({
        creator: creatorAddress,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} controller
   * @param {string} sourceObjectId
   * @param {string} allocationType
   * @param {number} power
   * @return {{typeUrl: string, value: MsgAllocationCreate}}
   */
  createMsgAllocationCreate(creatorAddress, controller, sourceObjectId, allocationType, power) {
    return {
      typeUrl: '/structs.structs.MsgAllocationCreate',
      value: MsgAllocationCreate.fromPartial({
        creator: creatorAddress,
        controller: controller,
        sourceObjectId: sourceObjectId,
        allocationType: allocationType,
        power: power
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @return {{typeUrl: string, value: MsgAllocationDelete}}
   */
  createMsgAllocationDelete(creatorAddress, allocationId) {
    return {
      typeUrl: '/structs.structs.MsgAllocationDelete',
      value: MsgAllocationDelete.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @param {number} power
   * @return {{typeUrl: string, value: MsgAllocationUpdate}}
   */
  createMsgAllocationUpdate(creatorAddress, allocationId, power) {
    return {
      typeUrl: '/structs.structs.MsgAllocationUpdate',
      value: MsgAllocationUpdate.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId,
        power: power
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @param {string} controller
   * @return {{typeUrl: string, value: MsgAllocationTransfer}}
   */
  createMsgAllocationTransfer(creatorAddress, allocationId, controller) {
    return {
      typeUrl: '/structs.structs.MsgAllocationTransfer',
      value: MsgAllocationTransfer.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId,
        controller: controller
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {number} amountAlpha
   * @param {number} amountToken
   * @return {{typeUrl: string, value: MsgGuildBankMint}}
   */
  createMsgGuildBankMint(creatorAddress, amountAlpha, amountToken) {
    return {
      typeUrl: '/structs.structs.MsgGuildBankMint',
      value: MsgGuildBankMint.fromPartial({
        creator: creatorAddress,
        amountAlpha: amountAlpha,
        amountToken: amountToken
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {Object} amountToken
   * @return {{typeUrl: string, value: MsgGuildBankRedeem}}
   */
  createMsgGuildBankRedeem(creatorAddress, amountToken) {
    return {
      typeUrl: '/structs.structs.MsgGuildBankRedeem',
      value: MsgGuildBankRedeem.fromPartial({
        creator: creatorAddress,
        amountToken: amountToken
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} amountToken
   * @return {{typeUrl: string, value: MsgGuildBankConfiscateAndBurn}}
   */
  createMsgGuildBankConfiscateAndBurn(creatorAddress, address, amountToken) {
    return {
      typeUrl: '/structs.structs.MsgGuildBankConfiscateAndBurn',
      value: MsgGuildBankConfiscateAndBurn.fromPartial({
        creator: creatorAddress,
        address: address,
        amountToken: amountToken
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} entrySubstationId
   * @return {{typeUrl: string, value: MsgGuildUpdateEntrySubstationId}}
   */
  createMsgGuildUpdateEntrySubstationId(creatorAddress, guildId, entrySubstationId) {
    return {
      typeUrl: '/structs.structs.MsgGuildUpdateEntrySubstationId',
      value: MsgGuildUpdateEntrySubstationId.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        entrySubstationId: entrySubstationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @return {{typeUrl: string, value: MsgGuildMembershipInvite}}
   */
  createMsgGuildMembershipInvite(creatorAddress, guildId, playerId, substationId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipInvite',
      value: MsgGuildMembershipInvite.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @return {{typeUrl: string, value: MsgGuildMembershipInviteApprove}}
   */
  createMsgGuildMembershipInviteApprove(creatorAddress, guildId, playerId, substationId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipInviteApprove',
      value: MsgGuildMembershipInviteApprove.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgGuildMembershipInviteDeny}}
   */
  createMsgGuildMembershipInviteDeny(creatorAddress, guildId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipInviteDeny',
      value: MsgGuildMembershipInviteDeny.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgGuildMembershipInviteRevoke}}
   */
  createMsgGuildMembershipInviteRevoke(creatorAddress, guildId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipInviteRevoke',
      value: MsgGuildMembershipInviteRevoke.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {string[]} infusionId
   * @return {{typeUrl: string, value: MsgGuildMembershipJoin}}
   */
  createMsgGuildMembershipJoin(creatorAddress, guildId, playerId, substationId, infusionId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipJoin',
      value: MsgGuildMembershipJoin.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId,
        infusionId: infusionId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgGuildMembershipKick}}
   */
  createMsgGuildMembershipKick(creatorAddress, guildId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipKick',
      value: MsgGuildMembershipKick.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @return {{typeUrl: string, value: MsgGuildMembershipRequest}}
   */
  createMsgGuildMembershipRequest(creatorAddress, guildId, playerId, substationId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipRequest',
      value: MsgGuildMembershipRequest.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @return {{typeUrl: string, value: MsgGuildMembershipRequestApprove}}
   */
  createMsgGuildMembershipRequestApprove(creatorAddress, guildId, playerId, substationId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipRequestApprove',
      value: MsgGuildMembershipRequestApprove.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgGuildMembershipRequestDeny}}
   */
  createMsgGuildMembershipRequestDeny(creatorAddress, guildId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipRequestDeny',
      value: MsgGuildMembershipRequestDeny.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgGuildMembershipRequestRevoke}}
   */
  createMsgGuildMembershipRequestRevoke(creatorAddress, guildId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgGuildMembershipRequestRevoke',
      value: MsgGuildMembershipRequestRevoke.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgPermissionGrantOnObject}}
   */
  createMsgPermissionGrantOnObject(creatorAddress, objectId, playerId, permissions) {
    return {
      typeUrl: '/structs.structs.MsgPermissionGrantOnObject',
      value: MsgPermissionGrantOnObject.fromPartial({
        creator: creatorAddress,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgPermissionGrantOnAddress}}
   */
  createMsgPermissionGrantOnAddress(creatorAddress, address, permissions) {
    return {
      typeUrl: '/structs.structs.MsgPermissionGrantOnAddress',
      value: MsgPermissionGrantOnAddress.fromPartial({
        creator: creatorAddress,
        address: address,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgPermissionRevokeOnObject}}
   */
  createMsgPermissionRevokeOnObject(creatorAddress, objectId, playerId, permissions) {
    return {
      typeUrl: '/structs.structs.MsgPermissionRevokeOnObject',
      value: MsgPermissionRevokeOnObject.fromPartial({
        creator: creatorAddress,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgPermissionRevokeOnAddress}}
   */
  createMsgPermissionRevokeOnAddress(creatorAddress, address, permissions) {
    return {
      typeUrl: '/structs.structs.MsgPermissionRevokeOnAddress',
      value: MsgPermissionRevokeOnAddress.fromPartial({
        creator: creatorAddress,
        address: address,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgPermissionSetOnObject}}
   */
  createMsgPermissionSetOnObject(creatorAddress, objectId, playerId, permissions) {
    return {
      typeUrl: '/structs.structs.MsgPermissionSetOnObject',
      value: MsgPermissionSetOnObject.fromPartial({
        creator: creatorAddress,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} permissions
   * @return {{typeUrl: string, value: MsgPermissionSetOnAddress}}
   */
  createMsgPermissionSetOnAddress(creatorAddress, address, permissions) {
    return {
      typeUrl: '/structs.structs.MsgPermissionSetOnAddress',
      value: MsgPermissionSetOnAddress.fromPartial({
        creator: creatorAddress,
        address: address,
        permissions: permissions
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @param {string} primaryAddress
   * @return {{typeUrl: string, value: MsgPlayerUpdatePrimaryAddress}}
   */
  createMsgPlayerUpdatePrimaryAddress(creatorAddress, playerId, primaryAddress) {
    return {
      typeUrl: '/structs.structs.MsgPlayerUpdatePrimaryAddress',
      value: MsgPlayerUpdatePrimaryAddress.fromPartial({
        creator: creatorAddress,
        playerId: playerId,
        primaryAddress: primaryAddress
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgPlayerResume}}
   */
  createMsgPlayerResume(creatorAddress, playerId) {
    return {
      typeUrl: '/structs.structs.MsgPlayerResume',
      value: MsgPlayerResume.fromPartial({
        creator: creatorAddress,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @return {{typeUrl: string, value: MsgStructActivate}}
   */
  createMsgStructActivate(creatorAddress, structId) {
    return {
      typeUrl: '/structs.structs.MsgStructActivate',
      value: MsgStructActivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @return {{typeUrl: string, value: MsgStructDeactivate}}
   */
  createMsgStructDeactivate(creatorAddress, structId) {
    return {
      typeUrl: '/structs.structs.MsgStructDeactivate',
      value: MsgStructDeactivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @param {number} structTypeId
   * @param {string} operatingAmbit
   * @param {number} slot
   * @return {{typeUrl: string, value: MsgStructBuildInitiate}}
   */
  createMsgStructBuildInitiate(creatorAddress, playerId, structTypeId, operatingAmbit, slot) {
    return {
      typeUrl: '/structs.structs.MsgStructBuildInitiate',
      value: MsgStructBuildInitiate.fromPartial({
        creator: creatorAddress,
        playerId: playerId,
        structTypeId: structTypeId,
        operatingAmbit: operatingAmbit,
        slot: slot
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @return {{typeUrl: string, value: MsgStructBuildCancel}}
   */
  createMsgStructBuildCancel(creatorAddress, structId) {
    return {
      typeUrl: '/structs.structs.MsgStructBuildCancel',
      value: MsgStructBuildCancel.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} defenderStructId
   * @param {string} protectedStructId
   * @return {{typeUrl: string, value: MsgStructDefenseSet}}
   */
  createMsgStructDefenseSet(creatorAddress, defenderStructId, protectedStructId) {
    return {
      typeUrl: '/structs.structs.MsgStructDefenseSet',
      value: MsgStructDefenseSet.fromPartial({
        creator: creatorAddress,
        defenderStructId: defenderStructId,
        protectedStructId: protectedStructId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} defenderStructId
   * @return {{typeUrl: string, value: MsgStructDefenseClear}}
   */
  createMsgStructDefenseClear(creatorAddress, defenderStructId) {
    return {
      typeUrl: '/structs.structs.MsgStructDefenseClear',
      value: MsgStructDefenseClear.fromPartial({
        creator: creatorAddress,
        defenderStructId: defenderStructId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} locationType
   * @param {string} ambit
   * @param {number} slot
   * @return {{typeUrl: string, value: MsgStructMove}}
   */
  createMsgStructMove(creatorAddress, structId, locationType, ambit, slot) {
    return {
      typeUrl: '/structs.structs.MsgStructMove',
      value: MsgStructMove.fromPartial({
        creator: creatorAddress,
        structId: structId,
        locationType: locationType,
        ambit: ambit,
        slot: slot
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} operatingStructId
   * @param {string[]} targetStructId
   * @param {string} weaponSystem
   * @return {{typeUrl: string, value: MsgStructAttack}}
   */
  createMsgStructAttack(creatorAddress, operatingStructId, targetStructId, weaponSystem) {
    return {
      typeUrl: '/structs.structs.MsgStructAttack',
      value: MsgStructAttack.fromPartial({
        creator: creatorAddress,
        operatingStructId: operatingStructId,
        targetStructId: targetStructId,
        weaponSystem: weaponSystem
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @return {{typeUrl: string, value: MsgStructStealthActivate}}
   */
  createMsgStructStealthActivate(creatorAddress, structId) {
    return {
      typeUrl: '/structs.structs.MsgStructStealthActivate',
      value: MsgStructStealthActivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @return {{typeUrl: string, value: MsgStructStealthDeactivate}}
   */
  createMsgStructStealthDeactivate(creatorAddress, structId) {
    return {
      typeUrl: '/structs.structs.MsgStructStealthDeactivate',
      value: MsgStructStealthDeactivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} infuseAmount
   * @return {{typeUrl: string, value: MsgStructGeneratorInfuse}}
   */
  createMsgStructGeneratorInfuse(creatorAddress, structId, infuseAmount) {
    return {
      typeUrl: '/structs.structs.MsgStructGeneratorInfuse',
      value: MsgStructGeneratorInfuse.fromPartial({
        creator: creatorAddress,
        structId: structId,
        infuseAmount: infuseAmount
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} owner
   * @param {string} allocationId
   * @return {{typeUrl: string, value: MsgSubstationCreate}}
   */
  createMsgSubstationCreate(creatorAddress, owner, allocationId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationCreate',
      value: MsgSubstationCreate.fromPartial({
        creator: creatorAddress,
        owner: owner,
        allocationId: allocationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {string} migrationSubstationId
   * @return {{typeUrl: string, value: MsgSubstationDelete}}
   */
  createMsgSubstationDelete(creatorAddress, substationId, migrationSubstationId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationDelete',
      value: MsgSubstationDelete.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        migrationSubstationId: migrationSubstationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @param {string} destinationId
   * @return {{typeUrl: string, value: MsgSubstationAllocationConnect}}
   */
  createMsgSubstationAllocationConnect(creatorAddress, allocationId, destinationId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationAllocationConnect',
      value: MsgSubstationAllocationConnect.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId,
        destinationId: destinationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @return {{typeUrl: string, value: MsgSubstationAllocationDisconnect}}
   */
  createMsgSubstationAllocationDisconnect(creatorAddress, allocationId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationAllocationDisconnect',
      value: MsgSubstationAllocationDisconnect.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgSubstationPlayerConnect}}
   */
  createMsgSubstationPlayerConnect(creatorAddress, substationId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationPlayerConnect',
      value: MsgSubstationPlayerConnect.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @return {{typeUrl: string, value: MsgSubstationPlayerDisconnect}}
   */
  createMsgSubstationPlayerDisconnect(creatorAddress, playerId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationPlayerDisconnect',
      value: MsgSubstationPlayerDisconnect.fromPartial({
        creator: creatorAddress,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {string[]} playerId
   * @return {{typeUrl: string, value: MsgSubstationPlayerMigrate}}
   */
  createMsgSubstationPlayerMigrate(creatorAddress, substationId, playerId) {
    return {
      typeUrl: '/structs.structs.MsgSubstationPlayerMigrate',
      value: MsgSubstationPlayerMigrate.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        playerId: playerId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} duration
   * @param {number} capacity
   * @return {{typeUrl: string, value: MsgAgreementOpen}}
   */
  createMsgAgreementOpen(creatorAddress, providerId, duration, capacity) {
    return {
      typeUrl: '/structs.structs.MsgAgreementOpen',
      value: MsgAgreementOpen.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        duration: duration,
        capacity: capacity
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @return {{typeUrl: string, value: MsgAgreementClose}}
   */
  createMsgAgreementClose(creatorAddress, agreementId) {
    return {
      typeUrl: '/structs.structs.MsgAgreementClose',
      value: MsgAgreementClose.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @param {number} capacityIncrease
   * @return {{typeUrl: string, value: MsgAgreementCapacityIncrease}}
   */
  createMsgAgreementCapacityIncrease(creatorAddress, agreementId, capacityIncrease) {
    return {
      typeUrl: '/structs.structs.MsgAgreementCapacityIncrease',
      value: MsgAgreementCapacityIncrease.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId,
        capacityIncrease: capacityIncrease
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @param {number} capacityDecrease
   * @return {{typeUrl: string, value: MsgAgreementCapacityDecrease}}
   */
  createMsgAgreementCapacityDecrease(creatorAddress, agreementId, capacityDecrease) {
    return {
      typeUrl: '/structs.structs.MsgAgreementCapacityDecrease',
      value: MsgAgreementCapacityDecrease.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId,
        capacityDecrease: capacityDecrease
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @param {number} durationIncrease
   * @return {{typeUrl: string, value: MsgAgreementDurationIncrease}}
   */
  createMsgAgreementDurationIncrease(creatorAddress, agreementId, durationIncrease) {
    return {
      typeUrl: '/structs.structs.MsgAgreementDurationIncrease',
      value: MsgAgreementDurationIncrease.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId,
        durationIncrease: durationIncrease
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {Object} rate
   * @param {string} accessPolicy
   * @param {string} providerCancellationPenalty
   * @param {string} consumerCancellationPenalty
   * @param {number} capacityMinimum
   * @param {number} capacityMaximum
   * @param {number} durationMinimum
   * @param {number} durationMaximum
   * @return {{typeUrl: string, value: MsgProviderCreate}}
   */
  createMsgProviderCreate(creatorAddress, substationId, rate, accessPolicy, providerCancellationPenalty, consumerCancellationPenalty, capacityMinimum, capacityMaximum, durationMinimum, durationMaximum) {
    return {
      typeUrl: '/structs.structs.MsgProviderCreate',
      value: MsgProviderCreate.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        rate: rate,
        accessPolicy: accessPolicy,
        providerCancellationPenalty: providerCancellationPenalty,
        consumerCancellationPenalty: consumerCancellationPenalty,
        capacityMinimum: capacityMinimum,
        capacityMaximum: capacityMaximum,
        durationMinimum: durationMinimum,
        durationMaximum: durationMaximum
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string} destinationAddress
   * @return {{typeUrl: string, value: MsgProviderWithdrawBalance}}
   */
  createMsgProviderWithdrawBalance(creatorAddress, providerId, destinationAddress) {
    return {
      typeUrl: '/structs.structs.MsgProviderWithdrawBalance',
      value: MsgProviderWithdrawBalance.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        destinationAddress: destinationAddress
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMinimumCapacity
   * @return {{typeUrl: string, value: MsgProviderUpdateCapacityMinimum}}
   */
  createMsgProviderUpdateCapacityMinimum(creatorAddress, providerId, newMinimumCapacity) {
    return {
      typeUrl: '/structs.structs.MsgProviderUpdateCapacityMinimum',
      value: MsgProviderUpdateCapacityMinimum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMinimumCapacity: newMinimumCapacity
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMaximumCapacity
   * @return {{typeUrl: string, value: MsgProviderUpdateCapacityMaximum}}
   */
  createMsgProviderUpdateCapacityMaximum(creatorAddress, providerId, newMaximumCapacity) {
    return {
      typeUrl: '/structs.structs.MsgProviderUpdateCapacityMaximum',
      value: MsgProviderUpdateCapacityMaximum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMaximumCapacity: newMaximumCapacity
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMinimumDuration
   * @return {{typeUrl: string, value: MsgProviderUpdateDurationMinimum}}
   */
  createMsgProviderUpdateDurationMinimum(creatorAddress, providerId, newMinimumDuration) {
    return {
      typeUrl: '/structs.structs.MsgProviderUpdateDurationMinimum',
      value: MsgProviderUpdateDurationMinimum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMinimumDuration: newMinimumDuration
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMaximumDuration
   * @return {{typeUrl: string, value: MsgProviderUpdateDurationMaximum}}
   */
  createMsgProviderUpdateDurationMaximum(creatorAddress, providerId, newMaximumDuration) {
    return {
      typeUrl: '/structs.structs.MsgProviderUpdateDurationMaximum',
      value: MsgProviderUpdateDurationMaximum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMaximumDuration: newMaximumDuration
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string} accessPolicy
   * @return {{typeUrl: string, value: MsgProviderUpdateAccessPolicy}}
   */
  createMsgProviderUpdateAccessPolicy(creatorAddress, providerId, accessPolicy) {
    return {
      typeUrl: '/structs.structs.MsgProviderUpdateAccessPolicy',
      value: MsgProviderUpdateAccessPolicy.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        accessPolicy: accessPolicy
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string[]} guildId
   * @return {{typeUrl: string, value: MsgProviderGuildGrant}}
   */
  createMsgProviderGuildGrant(creatorAddress, providerId, guildId) {
    return {
      typeUrl: '/structs.structs.MsgProviderGuildGrant',
      value: MsgProviderGuildGrant.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        guildId: guildId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string[]} guildId
   * @return {{typeUrl: string, value: MsgProviderGuildRevoke}}
   */
  createMsgProviderGuildRevoke(creatorAddress, providerId, guildId) {
    return {
      typeUrl: '/structs.structs.MsgProviderGuildRevoke',
      value: MsgProviderGuildRevoke.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        guildId: guildId
      }),
    }
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @return {{typeUrl: string, value: MsgProviderDelete}}
   */
  createMsgProviderDelete(creatorAddress, providerId) {
    return {
      typeUrl: '/structs.structs.MsgProviderDelete',
      value: MsgProviderDelete.fromPartial({
        creator: creatorAddress,
        providerId: providerId
      }),
    }
  }

}