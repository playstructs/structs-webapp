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
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {LOCATION_TYPE_INDEX} from "../constants/LocationTypes";

export class SigningClientManager {

  /**
   * @param {GameState} gameState
   */
  constructor(gameState) {
    console.log('Initiating Signing Client Manager');
    this.gameState = gameState;

    // TODO Make this value more dynamic
    // Possibly a database setting or env, provided via server
    //this.wsUrl = `ws://${window.location.hostname}:26657`;
    this.wsUrl = `ws://reactor.oh.energy:26657`;

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
          const response = await this.gameState.signingClient.signAndBroadcast(
              this.gameState.signingAccount.address,
              processMessageQueue,
              FEE
          );
          console.log('Transaction Hash:', response.transactionHash);
          console.log('Code:', response.code);
          console.log('Height:', response.height);
          console.log('Msg Responses:', response.msgResponses.map(msg => ({
            typeUrl: msg.typeUrl,
            value: this.registry.decode(msg)
          })));
          console.log('Events:', response.events);
        } catch (error) {
          console.log('Sign and Broadcast Error:', error);
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
   * @param {string} fromPlayerId
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {Array<{denom: string, amount: string}>} amount
   */
  async queueMsgPlayerSend(fromPlayerId, fromAddress, toAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlayerSend',
      value: MsgPlayerSend.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: fromPlayerId,
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} playerId
   */
  async queueMsgPlanetExplore(playerId) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgPlanetExplore',
      value: MsgPlanetExplore.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} playerId
   * @param {string} addressToRegister
   * @param {string} proofPubKey
   * @param {string} proofSignature
   * @param {number} permissions
   */
  async queueMsgAddressRegister(playerId, addressToRegister, proofPubKey, proofSignature, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgAddressRegister',
      value: MsgAddressRegister.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: playerId,
        address: addressToRegister,
        proofPubKey: proofPubKey,
        proofSignature: proofSignature,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} addressToRevoke
   */
  async queueMsgAddressRevoke(addressToRevoke) {
    this.queue({
      typeUrl: '/structs.structs.MsgAddressRevoke',
      value: MsgAddressRevoke.fromPartial({
        creator: this.gameState.signingAccount.address,
        address: addressToRevoke
      }),
    });
  }

  /**
   * @param {string} fleetId
   * @param {string} destinationLocationId
   */
  async queueMsgFleetMove(fleetId, destinationLocationId) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgFleetMove',
      value: MsgFleetMove.fromPartial({
        creator: this.gameState.signingAccount.address,
        fleetId: fleetId,
        destinationLocationId: destinationLocationId
      }),
    });
  }

  /**
   * @param {string} fleetId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgPlanetRaidComplete(fleetId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlanetRaidComplete',
      value: MsgPlanetRaidComplete.fromPartial({
        creator: this.gameState.signingAccount.address,
        fleetId: fleetId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgStructBuildComplete(structId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructBuildComplete',
      value: MsgStructBuildComplete.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgStructOreMinerComplete(structId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructOreMinerComplete',
      value: MsgStructOreMinerComplete.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   */
  async queueMsgStructOreRefineryComplete(structId, proof, nonce) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructOreRefineryComplete',
      value: MsgStructOreRefineryComplete.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId,
        proof: proof,
        nonce: nonce
      }),
    });
  }

  /**
   * @param {string} controller
   * @param {string} sourceObjectId
   * @param {string} allocationType
   * @param {number} power
   */
  async queueMsgAllocationCreate(controller, sourceObjectId, allocationType, power) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationCreate',
      value: MsgAllocationCreate.fromPartial({
        creator: this.gameState.signingAccount.address,
        controller: controller,
        sourceObjectId: sourceObjectId,
        allocationType: allocationType,
        power: power
      }),
    });
  }

  /**
   * @param {string} allocationId
   */
  async queueMsgAllocationDelete(allocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationDelete',
      value: MsgAllocationDelete.fromPartial({
        creator: this.gameState.signingAccount.address,
        allocationId: allocationId
      }),
    });
  }

  /**
   * @param {string} allocationId
   * @param {number} power
   */
  async queueMsgAllocationUpdate(allocationId, power) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationUpdate',
      value: MsgAllocationUpdate.fromPartial({
        creator: this.gameState.signingAccount.address,
        allocationId: allocationId,
        power: power
      }),
    });
  }

  /**
   * @param {string} allocationId
   * @param {string} controller
   */
  async queueMsgAllocationTransfer(allocationId, controller) {
    this.queue({
      typeUrl: '/structs.structs.MsgAllocationTransfer',
      value: MsgAllocationTransfer.fromPartial({
        creator: this.gameState.signingAccount.address,
        allocationId: allocationId,
        controller: controller
      }),
    });
  }

  /**
   * @param {number} amountAlpha
   * @param {number} amountToken
   */
  async queueMsgGuildBankMint(amountAlpha, amountToken) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildBankMint',
      value: MsgGuildBankMint.fromPartial({
        creator: this.gameState.signingAccount.address,
        amountAlpha: amountAlpha,
        amountToken: amountToken
      }),
    });
  }

  /**
   * @param {{denom: string, amount: string}} amountToken
   */
  async queueMsgGuildBankRedeem(amountToken) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildBankRedeem',
      value: MsgGuildBankRedeem.fromPartial({
        creator: this.gameState.signingAccount.address,
        amountToken: amountToken
      }),
    });
  }

  /**
   * @param {string} address
   * @param {number} amountToken
   */
  async queueMsgGuildBankConfiscateAndBurn(address, amountToken) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildBankConfiscateAndBurn',
      value: MsgGuildBankConfiscateAndBurn.fromPartial({
        creator: this.gameState.signingAccount.address,
        address: address,
        amountToken: amountToken
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} entrySubstationId
   */
  async queueMsgGuildUpdateEntrySubstationId(guildId, entrySubstationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildUpdateEntrySubstationId',
      value: MsgGuildUpdateEntrySubstationId.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        entrySubstationId: entrySubstationId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipInvite(guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInvite',
      value: MsgGuildMembershipInvite.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipInviteApprove(guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInviteApprove',
      value: MsgGuildMembershipInviteApprove.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipInviteDeny(guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInviteDeny',
      value: MsgGuildMembershipInviteDeny.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipInviteRevoke(guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipInviteRevoke',
      value: MsgGuildMembershipInviteRevoke.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {string[]} infusionId
   */
  async queueMsgGuildMembershipJoin(guildId, playerId, substationId, infusionId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipJoin',
      value: MsgGuildMembershipJoin.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId,
        infusionId: infusionId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipKick(guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipKick',
      value: MsgGuildMembershipKick.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipRequest(guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequest',
      value: MsgGuildMembershipRequest.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   */
  async queueMsgGuildMembershipRequestApprove(guildId, playerId, substationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequestApprove',
      value: MsgGuildMembershipRequestApprove.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId,
        substationId: substationId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipRequestDeny(guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequestDeny',
      value: MsgGuildMembershipRequestDeny.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   */
  async queueMsgGuildMembershipRequestRevoke(guildId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgGuildMembershipRequestRevoke',
      value: MsgGuildMembershipRequestRevoke.fromPartial({
        creator: this.gameState.signingAccount.address,
        guildId: guildId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   */
  async queueMsgPermissionGrantOnObject(objectId, playerId, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionGrantOnObject',
      value: MsgPermissionGrantOnObject.fromPartial({
        creator: this.gameState.signingAccount.address,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} address
   * @param {number} permissions
   */
  async queueMsgPermissionGrantOnAddress(address, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionGrantOnAddress',
      value: MsgPermissionGrantOnAddress.fromPartial({
        creator: this.gameState.signingAccount.address,
        address: address,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   */
  async queueMsgPermissionRevokeOnObject(objectId, playerId, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionRevokeOnObject',
      value: MsgPermissionRevokeOnObject.fromPartial({
        creator: this.gameState.signingAccount.address,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} address
   * @param {number} permissions
   */
  async queueMsgPermissionRevokeOnAddress(address, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionRevokeOnAddress',
      value: MsgPermissionRevokeOnAddress.fromPartial({
        creator: this.gameState.signingAccount.address,
        address: address,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   */
  async queueMsgPermissionSetOnObject(objectId, playerId, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionSetOnObject',
      value: MsgPermissionSetOnObject.fromPartial({
        creator: this.gameState.signingAccount.address,
        objectId: objectId,
        playerId: playerId,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} address
   * @param {number} permissions
   */
  async queueMsgPermissionSetOnAddress(address, permissions) {
    this.queue({
      typeUrl: '/structs.structs.MsgPermissionSetOnAddress',
      value: MsgPermissionSetOnAddress.fromPartial({
        creator: this.gameState.signingAccount.address,
        address: address,
        permissions: permissions
      }),
    });
  }

  /**
   * @param {string} playerId
   * @param {string} primaryAddress
   */
  async queueMsgPlayerUpdatePrimaryAddress(playerId, primaryAddress) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlayerUpdatePrimaryAddress',
      value: MsgPlayerUpdatePrimaryAddress.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: playerId,
        primaryAddress: primaryAddress
      }),
    });
  }

  /**
   * @param {string} playerId
   */
  async queueMsgPlayerResume(playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgPlayerResume',
      value: MsgPlayerResume.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} structId
   */
  async queueMsgStructActivate(structId) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgStructActivate',
      value: MsgStructActivate.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} structId
   */
  async queueMsgStructDeactivate(structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructDeactivate',
      value: MsgStructDeactivate.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} playerId
   * @param {number} structTypeId
   * @param {string} operatingAmbit
   * @param {number} slot
   */
  async queueMsgStructBuildInitiate(playerId, structTypeId, operatingAmbit, slot) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    const ambitNumber = AMBIT_ENUM[operatingAmbit.toUpperCase()];
    this.queue({
      typeUrl: '/structs.structs.MsgStructBuildInitiate',
      value: MsgStructBuildInitiate.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: playerId,
        structTypeId: structTypeId,
        operatingAmbit: ambitNumber,
        slot: slot
      }),
    });
  }

  /**
   * @param {string} structId
   */
  async queueMsgStructBuildCancel(structId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructBuildCancel',
      value: MsgStructBuildCancel.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} defenderStructId
   * @param {string} protectedStructId
   */
  async queueMsgStructDefenseSet(defenderStructId, protectedStructId) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgStructDefenseSet',
      value: MsgStructDefenseSet.fromPartial({
        creator: this.gameState.signingAccount.address,
        defenderStructId: defenderStructId,
        protectedStructId: protectedStructId
      }),
    });
  }

  /**
   * @param {string} defenderStructId
   */
  async queueMsgStructDefenseClear(defenderStructId) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructDefenseClear',
      value: MsgStructDefenseClear.fromPartial({
        creator: this.gameState.signingAccount.address,
        defenderStructId: defenderStructId
      }),
    });
  }

  /**
   * @param {string} structId
   * @param {string} locationType
   * @param {string} ambit
   * @param {number} slot
   */
  async queueMsgStructMove(structId, locationType, ambit, slot) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    const locationTypeIndex = LOCATION_TYPE_INDEX[locationType.toLowerCase()];
    const ambitNumber = AMBIT_ENUM[ambit.toUpperCase()];
    this.queue({
      typeUrl: '/structs.structs.MsgStructMove',
      value: MsgStructMove.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId,
        locationType: locationTypeIndex,
        ambit: ambitNumber,
        slot: slot
      }),
    });
  }

  /**
   * @param {string} operatingStructId
   * @param {string[]} targetStructId
   * @param {string} weaponSystem
   */
  async queueMsgStructAttack(operatingStructId, targetStructId, weaponSystem) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgStructAttack',
      value: MsgStructAttack.fromPartial({
        creator: this.gameState.signingAccount.address,
        operatingStructId: operatingStructId,
        targetStructId: targetStructId,
        weaponSystem: weaponSystem
      }),
    });
  }

  /**
   * @param {string} structId
   */
  async queueMsgStructStealthActivate(structId) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgStructStealthActivate',
      value: MsgStructStealthActivate.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} structId
   */
  async queueMsgStructStealthDeactivate(structId) {
    this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].setLastActionBlockHeight(this.gameState.currentBlockHeight, this.gameState.currentBlockHeight + 1);
    this.queue({
      typeUrl: '/structs.structs.MsgStructStealthDeactivate',
      value: MsgStructStealthDeactivate.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId
      }),
    });
  }

  /**
   * @param {string} structId
   * @param {string} infuseAmount
   */
  async queueMsgStructGeneratorInfuse(structId, infuseAmount) {
    this.queue({
      typeUrl: '/structs.structs.MsgStructGeneratorInfuse',
      value: MsgStructGeneratorInfuse.fromPartial({
        creator: this.gameState.signingAccount.address,
        structId: structId,
        infuseAmount: infuseAmount
      }),
    });
  }

  /**
   * @param {string} owner
   * @param {string} allocationId
   */
  async queueMsgSubstationCreate(owner, allocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationCreate',
      value: MsgSubstationCreate.fromPartial({
        creator: this.gameState.signingAccount.address,
        owner: owner,
        allocationId: allocationId
      }),
    });
  }

  /**
   * @param {string} substationId
   * @param {string} migrationSubstationId
   */
  async queueMsgSubstationDelete(substationId, migrationSubstationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationDelete',
      value: MsgSubstationDelete.fromPartial({
        creator: this.gameState.signingAccount.address,
        substationId: substationId,
        migrationSubstationId: migrationSubstationId
      }),
    });
  }

  /**
   * @param {string} allocationId
   * @param {string} destinationId
   */
  async queueMsgSubstationAllocationConnect(allocationId, destinationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationAllocationConnect',
      value: MsgSubstationAllocationConnect.fromPartial({
        creator: this.gameState.signingAccount.address,
        allocationId: allocationId,
        destinationId: destinationId
      }),
    });
  }

  /**
   * @param {string} allocationId
   */
  async queueMsgSubstationAllocationDisconnect(allocationId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationAllocationDisconnect',
      value: MsgSubstationAllocationDisconnect.fromPartial({
        creator: this.gameState.signingAccount.address,
        allocationId: allocationId
      }),
    });
  }

  /**
   * @param {string} substationId
   * @param {string} playerId
   */
  async queueMsgSubstationPlayerConnect(substationId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationPlayerConnect',
      value: MsgSubstationPlayerConnect.fromPartial({
        creator: this.gameState.signingAccount.address,
        substationId: substationId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} playerId
   */
  async queueMsgSubstationPlayerDisconnect(playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationPlayerDisconnect',
      value: MsgSubstationPlayerDisconnect.fromPartial({
        creator: this.gameState.signingAccount.address,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} substationId
   * @param {string[]} playerId
   */
  async queueMsgSubstationPlayerMigrate(substationId, playerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgSubstationPlayerMigrate',
      value: MsgSubstationPlayerMigrate.fromPartial({
        creator: this.gameState.signingAccount.address,
        substationId: substationId,
        playerId: playerId
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {number} duration
   * @param {number} capacity
   */
  async queueMsgAgreementOpen(providerId, duration, capacity) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementOpen',
      value: MsgAgreementOpen.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        duration: duration,
        capacity: capacity
      }),
    });
  }

  /**
   * @param {string} agreementId
   */
  async queueMsgAgreementClose(agreementId) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementClose',
      value: MsgAgreementClose.fromPartial({
        creator: this.gameState.signingAccount.address,
        agreementId: agreementId
      }),
    });
  }

  /**
   * @param {string} agreementId
   * @param {number} capacityIncrease
   */
  async queueMsgAgreementCapacityIncrease(agreementId, capacityIncrease) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementCapacityIncrease',
      value: MsgAgreementCapacityIncrease.fromPartial({
        creator: this.gameState.signingAccount.address,
        agreementId: agreementId,
        capacityIncrease: capacityIncrease
      }),
    });
  }

  /**
   * @param {string} agreementId
   * @param {number} capacityDecrease
   */
  async queueMsgAgreementCapacityDecrease(agreementId, capacityDecrease) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementCapacityDecrease',
      value: MsgAgreementCapacityDecrease.fromPartial({
        creator: this.gameState.signingAccount.address,
        agreementId: agreementId,
        capacityDecrease: capacityDecrease
      }),
    });
  }

  /**
   * @param {string} agreementId
   * @param {number} durationIncrease
   */
  async queueMsgAgreementDurationIncrease(agreementId, durationIncrease) {
    this.queue({
      typeUrl: '/structs.structs.MsgAgreementDurationIncrease',
      value: MsgAgreementDurationIncrease.fromPartial({
        creator: this.gameState.signingAccount.address,
        agreementId: agreementId,
        durationIncrease: durationIncrease
      }),
    });
  }

  /**
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
  async queueMsgProviderCreate(substationId, rate, accessPolicy, providerCancellationPenalty, consumerCancellationPenalty, capacityMinimum, capacityMaximum, durationMinimum, durationMaximum) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderCreate',
      value: MsgProviderCreate.fromPartial({
        creator: this.gameState.signingAccount.address,
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
   * @param {string} providerId
   * @param {string} destinationAddress
   */
  async queueMsgProviderWithdrawBalance(providerId, destinationAddress) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderWithdrawBalance',
      value: MsgProviderWithdrawBalance.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        destinationAddress: destinationAddress
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {number} newMinimumCapacity
   */
  async queueMsgProviderUpdateCapacityMinimum(providerId, newMinimumCapacity) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateCapacityMinimum',
      value: MsgProviderUpdateCapacityMinimum.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        newMinimumCapacity: newMinimumCapacity
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {number} newMaximumCapacity
   */
  async queueMsgProviderUpdateCapacityMaximum(providerId, newMaximumCapacity) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateCapacityMaximum',
      value: MsgProviderUpdateCapacityMaximum.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        newMaximumCapacity: newMaximumCapacity
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {number} newMinimumDuration
   */
  async queueMsgProviderUpdateDurationMinimum(providerId, newMinimumDuration) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateDurationMinimum',
      value: MsgProviderUpdateDurationMinimum.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        newMinimumDuration: newMinimumDuration
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {number} newMaximumDuration
   */
  async queueMsgProviderUpdateDurationMaximum(providerId, newMaximumDuration) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateDurationMaximum',
      value: MsgProviderUpdateDurationMaximum.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        newMaximumDuration: newMaximumDuration
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {string} accessPolicy
   */
  async queueMsgProviderUpdateAccessPolicy(providerId, accessPolicy) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderUpdateAccessPolicy',
      value: MsgProviderUpdateAccessPolicy.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        accessPolicy: accessPolicy
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {string[]} guildId
   */
  async queueMsgProviderGuildGrant(providerId, guildId) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderGuildGrant',
      value: MsgProviderGuildGrant.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        guildId: guildId
      }),
    });
  }

  /**
   * @param {string} providerId
   * @param {string[]} guildId
   */
  async queueMsgProviderGuildRevoke(providerId, guildId) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderGuildRevoke',
      value: MsgProviderGuildRevoke.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId,
        guildId: guildId
      }),
    });
  }

  /**
   * @param {string} providerId
   */
  async queueMsgProviderDelete(providerId) {
    this.queue({
      typeUrl: '/structs.structs.MsgProviderDelete',
      value: MsgProviderDelete.fromPartial({
        creator: this.gameState.signingAccount.address,
        providerId: providerId
      }),
    });
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   */
  async queueMsgReactorInfuse(delegatorAddress, validatorAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorInfuse',
      value: MsgReactorInfuse.fromPartial({
        creator: this.gameState.signingAccount.address,
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorSrcAddress
   * @param {string} validatorDstAddress
   * @param {{denom: string, amount: string}} amount
   */
  async queueMsgReactorBeginMigration(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorBeginMigration',
      value: MsgReactorBeginMigration.fromPartial({
        creator: this.gameState.signingAccount.address,
        delegatorAddress: delegatorAddress,
        validatorSrcAddress: validatorSrcAddress,
        validatorDstAddress: validatorDstAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   */
  async queueMsgReactorDefuse(delegatorAddress, validatorAddress, amount) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorDefuse',
      value: MsgReactorDefuse.fromPartial({
        creator: this.gameState.signingAccount.address,
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount
      }),
    });
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   * @param {number} creationHeight
   */
  async queueMsgReactorCancelDefusion(delegatorAddress, validatorAddress, amount, creationHeight) {
    this.queue({
      typeUrl: '/structs.structs.MsgReactorCancelDefusion',
      value: MsgReactorCancelDefusion.fromPartial({
        creator: this.gameState.signingAccount.address,
        delegatorAddress: delegatorAddress,
        validatorAddress: validatorAddress,
        amount: amount,
        creationHeight: creationHeight
      }),
    });
  }

}