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
  MsgPlayerSend,
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
  MsgProviderDelete,
  MsgReactorInfuse,
  MsgReactorBeginMigration,
  MsgReactorDefuse,
  MsgReactorCancelDefusion
} from "../ts/structs.structs/types/structs/structs/tx";
import {EVENTS} from "../constants/Events";
import {FEE} from "../constants/Fee";
import {AMBIT_ENUM} from "../constants/Ambits";
import {TASK} from "../constants/TaskConstants";

export class SigningClientManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    console.log('Initiating Signing Client Manager');
    this.gameState = gameState;
    this.wsUrl = `ws://${window.location.hostname}:26657`;
    this.registry = new Registry([...defaultRegistryTypes, ...msgTypes]);

    this.messageQueue = [];
    this.lastBroadcastHeight = 0;

    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, async function (event) {
     await this.transactQueue();
    }.bind(this));

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

  async transactQueue() {
    if (this.lastBroadcastHeight < this.gameState.currentBlockHeight) {
      this.lastBroadcastHeight = this.gameState.currentBlockHeight
      if (this.messageQueue.length > 0) {

        let processMessageQueue = [...this.messageQueue];
        this.messageQueue.splice(0,processMessageQueue.length);

        console.log('Running TransactQueue');
        console.log(processMessageQueue);
        // TODO establish a maximum of messages to include in a single transaction
        try {
          await this.gameState.signingClient.signAndBroadcast(
              this.gameState.signingAccount.address,
              processMessageQueue,
              FEE
          );
        } catch (error) {
          // There is always an error because our node hates this for some reason
          // Sign and Broadcast Error: Error: {"code":-32603,"message":"Internal error","data":"the TxIndexer.Search method is not supported"}
          //console.log('Sign and Broadcast Error:', error);
        }
      }
    }
  }

  /**
   * @param {object} msg
   * @return {string}
   */
  async queue(msg) {
    this.messageQueue.push(msg);
    await this.transactQueue();
  }

  /**
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {Array<{denom: string, amount: string}>} amount
   */
  async queueMsgBankSend(fromAddress, toAddress, amount) {
    this.queue({
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount
      },
    });
  }

/**
   * @param {string} creator
   * @param {string} fromPlayerId
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {Array<{denom: string, amount: string}>} amount
   */
  async queueMsgPlayerSend(creator, fromPlayerId, fromAddress, toAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlayerSend',
      value: MsgPlayerSend.fromPartial({
        creator: creator,
        playerId: fromPlayerId,
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} playerAddress
   * @param {string} playerId
   */
  async queueMsgPlanetExplore(playerAddress, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlanetExplore',
      value: MsgPlanetExplore.fromPartial({
        creator: playerAddress,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @param {string} addressToRegister
   * @param {string} proofPubKey
   * @param {string} proofSignature
   * @param {number} permissions
   */
  async queueMsgAddressRegister(creatorAddress, playerId, addressToRegister, proofPubKey, proofSignature, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgAddressRegister',
      value: MsgAddressRegister.fromPartial({
        creator: creatorAddress,
        playerId: playerId,
        address: addressToRegister,
        proofPubKey: proofPubKey,
        proofSignature: proofSignature,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} addressToRevoke
   */
  async queueMsgAddressRevoke(creatorAddress, addressToRevoke) {
    this.queue({
      typeUrl: '/structs.structs.MsgAddressRevoke',
      value: MsgAddressRevoke.fromPartial({
        creator: creatorAddress,
        address: addressToRevoke
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} fleetId
   * @param {string} destinationLocationId
   */
  async queueMsgFleetMove(creatorAddress, fleetId, destinationLocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgFleetMove',
      value: MsgFleetMove.fromPartial({
        creator: creatorAddress,
        fleetId: fleetId,
        destinationLocationId: destinationLocationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} fleetId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgPlanetRaidComplete(creatorAddress, fleetId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlanetRaidComplete',
      value: MsgPlanetRaidComplete.fromPartial({
        creator: creatorAddress,
        fleetId: fleetId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgStructBuildComplete(creatorAddress, structId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructBuildComplete',
      value: MsgStructBuildComplete.fromPartial({
        creator: creatorAddress,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgStructOreMinerComplete(creatorAddress, structId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructOreMinerComplete',
      value: MsgStructOreMinerComplete.fromPartial({
        creator: creatorAddress,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgStructOreRefineryComplete(creatorAddress, structId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructOreRefineryComplete',
      value: MsgStructOreRefineryComplete.fromPartial({
        creator: creatorAddress,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} controller
   * @param {string} sourceObjectId
   * @param {string} allocationType
   * @param {number} power
   */
  async queueMsgAllocationCreate(creatorAddress, controller, sourceObjectId, allocationType, power) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationCreate',
      value: MsgAllocationCreate.fromPartial({
        creator: creatorAddress,
        controller: controller,
        sourceObjectId: sourceObjectId,
        allocationType: allocationType,
        power: power
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   */
  async queueMsgAllocationDelete(creatorAddress, allocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationDelete',
      value: MsgAllocationDelete.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @param {number} power
   */
  async queueMsgAllocationUpdate(creatorAddress, allocationId, power) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationUpdate',
      value: MsgAllocationUpdate.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId,
        power: power
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @param {string} controller
   */
  async queueMsgAllocationTransfer(creatorAddress, allocationId, controller) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationTransfer',
      value: MsgAllocationTransfer.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId,
        controller: controller
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {number} amountAlpha
   * @param {number} amountToken
   */
  async queueMsgGuildBankMint(creatorAddress, amountAlpha, amountToken) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildBankMint',
      value: MsgGuildBankMint.fromPartial({
        creator: creatorAddress,
        amountAlpha: amountAlpha,
        amountToken: amountToken
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {{denom: string, amount: string}} amountToken
   */
  async queueMsgGuildBankRedeem(creatorAddress, amountToken) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildBankRedeem',
      value: MsgGuildBankRedeem.fromPartial({
        creator: creatorAddress,
        amountToken: amountToken
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} amountToken
   */
  async queueMsgGuildBankConfiscateAndBurn(creatorAddress, address, amountToken) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildBankConfiscateAndBurn',
      value: MsgGuildBankConfiscateAndBurn.fromPartial({
        creator: creatorAddress,
        address: address,
        amountToken: amountToken
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} entrySubstationId
   */
  async queueMsgGuildUpdateEntrySubstationId(creatorAddress, guildId, entrySubstationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildUpdateEntrySubstationId',
      value: MsgGuildUpdateEntrySubstationId.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        entrySubstationId: entrySubstationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipInvite(creatorAddress, guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInvite',
      value: MsgGuildMembershipInvite.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipInviteApprove(creatorAddress, guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInviteApprove',
      value: MsgGuildMembershipInviteApprove.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipInviteDeny(creatorAddress, guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInviteDeny',
      value: MsgGuildMembershipInviteDeny.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipInviteRevoke(creatorAddress, guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInviteRevoke',
      value: MsgGuildMembershipInviteRevoke.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {string[]} infusionId
   */
  async queueMsgGuildMembershipJoin(creatorAddress, guildId, playerId, substationId, infusionId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipJoin',
      value: MsgGuildMembershipJoin.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId,
        infusionId: infusionId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipKick(creatorAddress, guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipKick',
      value: MsgGuildMembershipKick.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipRequest(creatorAddress, guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequest',
      value: MsgGuildMembershipRequest.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipRequestApprove(creatorAddress, guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequestApprove',
      value: MsgGuildMembershipRequestApprove.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipRequestDeny(creatorAddress, guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequestDeny',
      value: MsgGuildMembershipRequestDeny.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipRequestRevoke(creatorAddress, guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequestRevoke',
      value: MsgGuildMembershipRequestRevoke.fromPartial({
        creator: creatorAddress,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   */
  async queueMsgPermissionGrantOnObject(creatorAddress, objectId, playerId, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionGrantOnObject',
      value: MsgPermissionGrantOnObject.fromPartial({
        creator: creatorAddress,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} permissions
   */
  async queueMsgPermissionGrantOnAddress(creatorAddress, address, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionGrantOnAddress',
      value: MsgPermissionGrantOnAddress.fromPartial({
        creator: creatorAddress,
        address: address,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   */
  async queueMsgPermissionRevokeOnObject(creatorAddress, objectId, playerId, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionRevokeOnObject',
      value: MsgPermissionRevokeOnObject.fromPartial({
        creator: creatorAddress,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} permissions
   */
  async queueMsgPermissionRevokeOnAddress(creatorAddress, address, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionRevokeOnAddress',
      value: MsgPermissionRevokeOnAddress.fromPartial({
        creator: creatorAddress,
        address: address,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   */
  async queueMsgPermissionSetOnObject(creatorAddress, objectId, playerId, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionSetOnObject',
      value: MsgPermissionSetOnObject.fromPartial({
        creator: creatorAddress,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} address
   * @param {number} permissions
   */
  async queueMsgPermissionSetOnAddress(creatorAddress, address, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionSetOnAddress',
      value: MsgPermissionSetOnAddress.fromPartial({
        creator: creatorAddress,
        address: address,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @param {string} primaryAddress
   */
  async queueMsgPlayerUpdatePrimaryAddress(creatorAddress, playerId, primaryAddress) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlayerUpdatePrimaryAddress',
      value: MsgPlayerUpdatePrimaryAddress.fromPartial({
        creator: creatorAddress,
        playerId: playerId,
        primaryAddress: primaryAddress
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   */
  async queueMsgPlayerResume(creatorAddress, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlayerResume',
      value: MsgPlayerResume.fromPartial({
        creator: creatorAddress,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   */
  async queueMsgStructActivate(creatorAddress, structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructActivate',
      value: MsgStructActivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   */
  async queueMsgStructDeactivate(creatorAddress, structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructDeactivate',
      value: MsgStructDeactivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   * @param {number} structTypeId
   * @param {string} operatingAmbit
   * @param {number} slot
   */
  async queueMsgStructBuildInitiate(creatorAddress, playerId, structTypeId, operatingAmbit, slot) {
    const ambitNumber = AMBIT_ENUM[operatingAmbit.toUpperCase()];
    this.queue({
      typeUrl: '/structs.structs.MsgStructBuildInitiate',
      value: MsgStructBuildInitiate.fromPartial({
        creator: creatorAddress,
        playerId: playerId,
        structTypeId: structTypeId,
        operatingAmbit: ambitNumber,
        slot: slot
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   */
  async queueMsgStructBuildCancel(creatorAddress, structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructBuildCancel',
      value: MsgStructBuildCancel.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} defenderStructId
   * @param {string} protectedStructId
   */
  async queueMsgStructDefenseSet(creatorAddress, defenderStructId, protectedStructId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructDefenseSet',
      value: MsgStructDefenseSet.fromPartial({
        creator: creatorAddress,
        defenderStructId: defenderStructId,
        protectedStructId: protectedStructId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} defenderStructId
   */
  async queueMsgStructDefenseClear(creatorAddress, defenderStructId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructDefenseClear',
      value: MsgStructDefenseClear.fromPartial({
        creator: creatorAddress,
        defenderStructId: defenderStructId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} locationType
   * @param {string} ambit
   * @param {number} slot
   */
  async queueMsgStructMove(creatorAddress, structId, locationType, ambit, slot) {
    const ambitNumber = AMBIT_ENUM[ambit.toUpperCase()];
    this.queue({
      typeUrl: '/structs.structs.MsgStructMove',
      value: MsgStructMove.fromPartial({
        creator: creatorAddress,
        structId: structId,
        locationType: locationType,
        ambit: ambitNumber,
        slot: slot
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} operatingStructId
   * @param {string[]} targetStructId
   * @param {string} weaponSystem
   */
  async queueMsgStructAttack(creatorAddress, operatingStructId, targetStructId, weaponSystem) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructAttack',
      value: MsgStructAttack.fromPartial({
        creator: creatorAddress,
        operatingStructId: operatingStructId,
        targetStructId: targetStructId,
        weaponSystem: weaponSystem
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   */
  async queueMsgStructStealthActivate(creatorAddress, structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructStealthActivate',
      value: MsgStructStealthActivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   */
  async queueMsgStructStealthDeactivate(creatorAddress, structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructStealthDeactivate',
      value: MsgStructStealthDeactivate.fromPartial({
        creator: creatorAddress,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} structId
   * @param {string} infuseAmount
   */
  async queueMsgStructGeneratorInfuse(creatorAddress, structId, infuseAmount) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructGeneratorInfuse',
      value: MsgStructGeneratorInfuse.fromPartial({
        creator: creatorAddress,
        structId: structId,
        infuseAmount: infuseAmount
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} owner
   * @param {string} allocationId
   */
  async queueMsgSubstationCreate(creatorAddress, owner, allocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationCreate',
      value: MsgSubstationCreate.fromPartial({
        creator: creatorAddress,
        owner: owner,
        allocationId: allocationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {string} migrationSubstationId
   */
  async queueMsgSubstationDelete(creatorAddress, substationId, migrationSubstationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationDelete',
      value: MsgSubstationDelete.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        migrationSubstationId: migrationSubstationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   * @param {string} destinationId
   */
  async queueMsgSubstationAllocationConnect(creatorAddress, allocationId, destinationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationAllocationConnect',
      value: MsgSubstationAllocationConnect.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId,
        destinationId: destinationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} allocationId
   */
  async queueMsgSubstationAllocationDisconnect(creatorAddress, allocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationAllocationDisconnect',
      value: MsgSubstationAllocationDisconnect.fromPartial({
        creator: creatorAddress,
        allocationId: allocationId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {string} playerId
   */
  async queueMsgSubstationPlayerConnect(creatorAddress, substationId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationPlayerConnect',
      value: MsgSubstationPlayerConnect.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} playerId
   */
  async queueMsgSubstationPlayerDisconnect(creatorAddress, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationPlayerDisconnect',
      value: MsgSubstationPlayerDisconnect.fromPartial({
        creator: creatorAddress,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {string[]} playerId
   */
  async queueMsgSubstationPlayerMigrate(creatorAddress, substationId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationPlayerMigrate',
      value: MsgSubstationPlayerMigrate.fromPartial({
        creator: creatorAddress,
        substationId: substationId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} duration
   * @param {number} capacity
   */
  async queueMsgAgreementOpen(creatorAddress, providerId, duration, capacity) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementOpen',
      value: MsgAgreementOpen.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        duration: duration,
        capacity: capacity
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   */
  async queueMsgAgreementClose(creatorAddress, agreementId) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementClose',
      value: MsgAgreementClose.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @param {number} capacityIncrease
   */
  async queueMsgAgreementCapacityIncrease(creatorAddress, agreementId, capacityIncrease) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementCapacityIncrease',
      value: MsgAgreementCapacityIncrease.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId,
        capacityIncrease: capacityIncrease
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @param {number} capacityDecrease
   */
  async queueMsgAgreementCapacityDecrease(creatorAddress, agreementId, capacityDecrease) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementCapacityDecrease',
      value: MsgAgreementCapacityDecrease.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId,
        capacityDecrease: capacityDecrease
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} agreementId
   * @param {number} durationIncrease
   */
  async queueMsgAgreementDurationIncrease(creatorAddress, agreementId, durationIncrease) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementDurationIncrease',
      value: MsgAgreementDurationIncrease.fromPartial({
        creator: creatorAddress,
        agreementId: agreementId,
        durationIncrease: durationIncrease
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} substationId
   * @param {{denom: string, amount: string}} rate
   * @param {string} accessPolicy
   * @param {string} providerCancellationPenalty
   * @param {string} consumerCancellationPenalty
   * @param {number} capacityMinimum
   * @param {number} capacityMaximum
   * @param {number} durationMinimum
   * @param {number} durationMaximum
   */
  async queueMsgProviderCreate(creatorAddress, substationId, rate, accessPolicy, providerCancellationPenalty, consumerCancellationPenalty, capacityMinimum, capacityMaximum, durationMinimum, durationMaximum) {
    this.queue({
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
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string} destinationAddress
   */
  async queueMsgProviderWithdrawBalance(creatorAddress, providerId, destinationAddress) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderWithdrawBalance',
      value: MsgProviderWithdrawBalance.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        destinationAddress: destinationAddress
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMinimumCapacity
   */
  async queueMsgProviderUpdateCapacityMinimum(creatorAddress, providerId, newMinimumCapacity) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateCapacityMinimum',
      value: MsgProviderUpdateCapacityMinimum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMinimumCapacity: newMinimumCapacity
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMaximumCapacity
   */
  async queueMsgProviderUpdateCapacityMaximum(creatorAddress, providerId, newMaximumCapacity) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateCapacityMaximum',
      value: MsgProviderUpdateCapacityMaximum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMaximumCapacity: newMaximumCapacity
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMinimumDuration
   */
  async queueMsgProviderUpdateDurationMinimum(creatorAddress, providerId, newMinimumDuration) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateDurationMinimum',
      value: MsgProviderUpdateDurationMinimum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMinimumDuration: newMinimumDuration
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {number} newMaximumDuration
   */
  async queueMsgProviderUpdateDurationMaximum(creatorAddress, providerId, newMaximumDuration) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateDurationMaximum',
      value: MsgProviderUpdateDurationMaximum.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        newMaximumDuration: newMaximumDuration
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string} accessPolicy
   */
  async queueMsgProviderUpdateAccessPolicy(creatorAddress, providerId, accessPolicy) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateAccessPolicy',
      value: MsgProviderUpdateAccessPolicy.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        accessPolicy: accessPolicy
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string[]} guildId
   */
  async queueMsgProviderGuildGrant(creatorAddress, providerId, guildId) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderGuildGrant',
      value: MsgProviderGuildGrant.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        guildId: guildId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   * @param {string[]} guildId
   */
  async queueMsgProviderGuildRevoke(creatorAddress, providerId, guildId) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderGuildRevoke',
      value: MsgProviderGuildRevoke.fromPartial({
        creator: creatorAddress,
        providerId: providerId,
        guildId: guildId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} providerId
   */
  async queueMsgProviderDelete(creatorAddress, providerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderDelete',
      value: MsgProviderDelete.fromPartial({
        creator: creatorAddress,
        providerId: providerId
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   */
  async queueMsgReactorInfuse(creatorAddress, delegatorAddress, validatorAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorInfuse',
      value: MsgReactorInfuse.fromPartial({
        creator: creatorAddress,
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} delegatorAddress
   * @param {string} validatorSrcAddress
   * @param {string} validatorDstAddress
   * @param {{denom: string, amount: string}} amount
   */
  async queueMsgReactorBeginMigration(creatorAddress, delegatorAddress, validatorSrcAddress, validatorDstAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorBeginMigration',
      value: MsgReactorBeginMigration.fromPartial({
        creator: creatorAddress,
        delegatorAddress: delegatorAddress,
        validatorSrcAddress: validatorSrcAddress,
        validatorDstAddress: validatorDstAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   */
  async queueMsgReactorDefuse(creatorAddress, delegatorAddress, validatorAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorDefuse',
      value: MsgReactorDefuse.fromPartial({
        creator: creatorAddress,
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} creatorAddress
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   * @param {number} creationHeight
   */
  async queueMsgReactorCancelDefusion(creatorAddress, delegatorAddress, validatorAddress, amount, creationHeight) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorCancelDefusion',
      value: MsgReactorCancelDefusion.fromPartial({
        creator: creatorAddress,
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount,
        creationHeight: creationHeight
      }),
    });
  }

}