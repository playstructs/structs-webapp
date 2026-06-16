import {Registry} from "@cosmjs/proto-signing";
import {defaultRegistryTypes, SigningStargateClient} from "@cosmjs/stargate";
// noinspection ES6PreferShortImport
import {msgTypes} from "../ts/structs.structs/registry";
import {AMBIT_ENUM} from "../constants/Ambits";
import {LOCATION_TYPE_INDEX} from "../constants/LocationTypes";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {SigningQueueManager} from "./SigningQueueManager";

/**
 * Thin transport + cosmos message catalog. Owns the cosmjs Registry, the WS
 * endpoint, and the signing client lifecycle. All queueing / scheduling /
 * persistence lives in {@link SigningQueueManager} (this.queue).
 *
 * Each queueMsg* builds a plain, JSON-serializable payload (NO `creator` — it
 * is injected at broadcast time from the transaction's accountAddress) and
 * delegates to enqueueImmediate / enqueueAction. The returned Promise resolves
 * when the transaction reaches a terminal state (succeeded / dropped /
 * cancelled); callers must check `tx.status` before acting on success.
 */
export class SigningClientManager {

  /**
   * @param {GameState} gameState
   * @param {boolean} publicEndpoint
   */
  constructor(gameState, publicEndpoint = false) {
    console.info('Initiating Signing Client Manager');
    this.gameState = gameState;

    // TODO Make this value more dynamic
    // Possibly a database setting or env, provided via server
    //this.wsUrl = `ws://${window.location.hostname}:26657`;
    this.publicEndpoint = publicEndpoint;
    this.wsUrl = this.publicEndpoint
        ? `wss://public.testnet.structs.network:26657`
        : `ws://${window.location.hostname}:26657`;
    console.info('[SigningClientManager] Endpoint ' + this.wsUrl);

    this.registry = new Registry([...defaultRegistryTypes, ...msgTypes]);

    this.queue = new SigningQueueManager(this.gameState, {
      registry: this.registry,
      wsUrl: this.wsUrl,
    });
  }

  /**
   * @param {DirectSecp256k1HdWallet} wallet
   * @return {Promise<void>}
   */
  async initSigningClient(wallet) {
    console.debug("Initializing signing client...");
    this.gameState.signingClient = await SigningStargateClient.connectWithSigner(
      this.wsUrl,
      wallet,
      {
        registry: this.registry,
      },
    );
    console.info("Signing client initialized.");

    // The signing account is now known — safe to rehydrate the per-account queue
    // (Review hardening #1: storage key needs the address).
    this.queue.loadPersistedState();
  }

  // ---------------------------------------------------------------------------
  // Mutation API — thin delegates so injection sites keep using signingClientManager
  // ---------------------------------------------------------------------------

  /**
   * @param {string} id
   * @return {boolean}
   */
  cancelQueueItem(id) {
    return this.queue.cancelQueueItem(id);
  }

  /**
   * @param {string} id
   * @param {number} newIndex
   * @return {boolean}
   */
  reorderActionQueue(id, newIndex) {
    return this.queue.reorderActionQueue(id, newIndex);
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  moveActionItemUp(id) {
    return this.queue.moveActionItemUp(id);
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  moveActionItemDown(id) {
    return this.queue.moveActionItemDown(id);
  }

  /**
   * @param {string} id
   * @return {import('../models/SigningTransaction').SigningTransaction|null}
   */
  getTransaction(id) {
    return this.queue.getTransaction(id);
  }

  // ---------------------------------------------------------------------------
  // Immediate-lane messages (no charge drain)
  // ---------------------------------------------------------------------------

  /**
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {Array<{denom: string, amount: string}>} amount
   * @param {object} [options]
   */
  async queueMsgPlayerSend(fromAddress, toAddress, amount, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlayerSend',
      {fromAddress, toAddress, amount},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {string} [name='']
   * @param {object} [options]
   */
  async queueMsgPlanetExplore(playerId, name = '', options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgPlanetExplore',
      {playerId, name},
      0,
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {string} addressToRegister
   * @param {string} proofPubKey
   * @param {string} proofSignature
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgAddressRegister(playerId, addressToRegister, proofPubKey, proofSignature, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAddressRegister',
      {playerId, address: addressToRegister, proofPubKey, proofSignature, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} addressToRevoke
   * @param {object} [options]
   */
  async queueMsgAddressRevoke(addressToRevoke, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAddressRevoke',
      {address: addressToRevoke},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} fleetId
   * @param {string} destinationLocationId
   * @param {object} [options]
   */
  async queueMsgFleetMove(fleetId, destinationLocationId, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgFleetMove',
      {fleetId, destinationLocationId},
      0,
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} fleetId
   * @param {string} proof
   * @param {string} nonce
   * @param {object} [options]
   */
  async queueMsgPlanetRaidComplete(fleetId, proof, nonce, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlanetRaidComplete',
      {fleetId, proof, nonce},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} planetId
   * @param {string} name
   * @param {object} [options]
   */
  async queueMsgPlanetUpdateName(planetId, name, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlanetUpdateName',
      {planetId, name},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   * @param {object} [options]
   */
  async queueMsgStructBuildComplete(structId, proof, nonce, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgStructBuildComplete',
      {structId, proof, nonce},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   * @param {object} [options]
   */
  async queueMsgStructOreMinerComplete(structId, proof, nonce, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgStructOreMinerComplete',
      {structId, proof, nonce},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {string} proof
   * @param {string} nonce
   * @param {object} [options]
   */
  async queueMsgStructOreRefineryComplete(structId, proof, nonce, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgStructOreRefineryComplete',
      {structId, proof, nonce},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} controller
   * @param {string} sourceObjectId
   * @param {string} allocationType
   * @param {number} power
   * @param {object} [options]
   */
  async queueMsgAllocationCreate(controller, sourceObjectId, allocationType, power, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAllocationCreate',
      {controller, sourceObjectId, allocationType, power},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} allocationId
   * @param {object} [options]
   */
  async queueMsgAllocationDelete(allocationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAllocationDelete',
      {allocationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} allocationId
   * @param {number} power
   * @param {object} [options]
   */
  async queueMsgAllocationUpdate(allocationId, power, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAllocationUpdate',
      {allocationId, power},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} allocationId
   * @param {string} controller
   * @param {object} [options]
   */
  async queueMsgAllocationTransfer(allocationId, controller, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAllocationTransfer',
      {allocationId, controller},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {number} amountAlpha
   * @param {number} amountToken
   * @param {object} [options]
   */
  async queueMsgGuildBankMint(amountAlpha, amountToken, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildBankMint',
      {amountAlpha, amountToken},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {{denom: string, amount: string}} amountToken
   * @param {object} [options]
   */
  async queueMsgGuildBankRedeem(amountToken, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildBankRedeem',
      {amountToken},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} address
   * @param {number} amountToken
   * @param {object} [options]
   */
  async queueMsgGuildBankConfiscateAndBurn(address, amountToken, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildBankConfiscateAndBurn',
      {address, amountToken},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} reactorId
   * @param {string} endpoint
   * @param {string} entrySubstationId
   * @param {object} [options]
   */
  async queueMsgGuildCreate(reactorId, endpoint, entrySubstationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildCreate',
      {reactorId, endpoint, entrySubstationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} entrySubstationId
   * @param {object} [options]
   */
  async queueMsgGuildUpdateEntrySubstationId(guildId, entrySubstationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateEntrySubstationId',
      {guildId, entrySubstationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} owner
   * @param {object} [options]
   */
  async queueMsgGuildUpdateOwnerId(guildId, owner, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateOwnerId',
      {guildId, owner},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} endpoint
   * @param {object} [options]
   */
  async queueMsgGuildUpdateEndpoint(guildId, endpoint, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateEndpoint',
      {guildId, endpoint},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} reactorId
   * @param {object} [options]
   */
  async queueMsgGuildUpdatePrimaryReactor(guildId, reactorId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdatePrimaryReactor',
      {guildId, reactorId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} name
   * @param {object} [options]
   */
  async queueMsgGuildUpdateName(guildId, name, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateName',
      {guildId, name},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} pfp
   * @param {object} [options]
   */
  async queueMsgGuildUpdatePfp(guildId, pfp, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdatePfp',
      {guildId, pfp},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {number} joinInfusionMinimum
   * @param {object} [options]
   */
  async queueMsgGuildUpdateJoinInfusionMinimum(guildId, joinInfusionMinimum, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateJoinInfusionMinimum',
      {guildId, joinInfusionMinimum},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {number} guildJoinBypassLevel
   * @param {object} [options]
   */
  async queueMsgGuildUpdateJoinInfusionMinimumBypassByInvite(guildId, guildJoinBypassLevel, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateJoinInfusionMinimumBypassByInvite',
      {guildId, guildJoinBypassLevel},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {number} guildJoinBypassLevel
   * @param {object} [options]
   */
  async queueMsgGuildUpdateJoinInfusionMinimumBypassByRequest(guildId, guildJoinBypassLevel, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateJoinInfusionMinimumBypassByRequest',
      {guildId, guildJoinBypassLevel},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {number} newEntryRank
   * @param {object} [options]
   */
  async queueMsgGuildUpdateEntryRank(newEntryRank, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildUpdateEntryRank',
      {newEntryRank},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipInvite(guildId, playerId, substationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipInvite',
      {guildId, playerId, substationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipInviteApprove(guildId, playerId, substationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipInviteApprove',
      {guildId, playerId, substationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipInviteDeny(guildId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipInviteDeny',
      {guildId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipInviteRevoke(guildId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipInviteRevoke',
      {guildId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {string[]} infusionId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipJoin(guildId, playerId, substationId, infusionId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipJoin',
      {guildId, playerId, substationId, infusionId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} address
   * @param {string} substationId
   * @param {string} proofPubKey
   * @param {string} proofSignature
   * @param {string} playerName
   * @param {string} playerPfp
   * @param {string} playerPfpClientRenderAttributes
   * @param {object} [options]
   */
  async queueMsgGuildMembershipJoinProxy(address, substationId, proofPubKey, proofSignature, playerName, playerPfp, playerPfpClientRenderAttributes, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipJoinProxy',
      {address, substationId, proofPubKey, proofSignature, playerName, playerPfp, playerPfpClientRenderAttributes},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipKick(guildId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipKick',
      {guildId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipRequest(guildId, playerId, substationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipRequest',
      {guildId, playerId, substationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {string} substationId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipRequestApprove(guildId, playerId, substationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipRequestApprove',
      {guildId, playerId, substationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipRequestDeny(guildId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipRequestDeny',
      {guildId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} guildId
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgGuildMembershipRequestRevoke(guildId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgGuildMembershipRequestRevoke',
      {guildId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgPermissionGrantOnObject(objectId, playerId, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionGrantOnObject',
      {objectId, playerId, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} address
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgPermissionGrantOnAddress(address, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionGrantOnAddress',
      {address, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgPermissionRevokeOnObject(objectId, playerId, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionRevokeOnObject',
      {objectId, playerId, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} address
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgPermissionRevokeOnAddress(address, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionRevokeOnAddress',
      {address, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} objectId
   * @param {string} playerId
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgPermissionSetOnObject(objectId, playerId, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionSetOnObject',
      {objectId, playerId, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} address
   * @param {number} permissions
   * @param {object} [options]
   */
  async queueMsgPermissionSetOnAddress(address, permissions, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionSetOnAddress',
      {address, permissions},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} objectId
   * @param {string} guildId
   * @param {number} permission
   * @param {number} rank
   * @param {object} [options]
   */
  async queueMsgPermissionGuildRankSet(objectId, guildId, permission, rank, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionGuildRankSet',
      {objectId, guildId, permission, rank},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} objectId
   * @param {string} guildId
   * @param {number} permission
   * @param {object} [options]
   */
  async queueMsgPermissionGuildRankRevoke(objectId, guildId, permission, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPermissionGuildRankRevoke',
      {objectId, guildId, permission},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} primaryAddress
   * @param {object} [options]
   */
  async queueMsgPlayerUpdatePrimaryAddress(primaryAddress, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlayerUpdatePrimaryAddress',
      {primaryAddress},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {number} guildRank
   * @param {object} [options]
   */
  async queueMsgPlayerUpdateGuildRank(playerId, guildRank, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlayerUpdateGuildRank',
      {playerId, guildRank},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {string} name
   * @param {object} [options]
   */
  async queueMsgPlayerUpdateName(playerId, name, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlayerUpdateName',
      {playerId, name},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {string} pfp
   * @param {object} [options]
   */
  async queueMsgPlayerUpdatePfp(playerId, pfp, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlayerUpdatePfp',
      {playerId, pfp},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {string} pfpClientRenderAttributes
   * @param {object} [options]
   */
  async queueMsgPlayerUpdatePfpClientRenderAttributes(playerId, pfpClientRenderAttributes, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgPlayerUpdatePfpClientRenderAttributes',
      {playerId, pfpClientRenderAttributes},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {object} [options]
   */
  async queueMsgStructDeactivate(structId, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructDeactivate',
      {structId},
      0,
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {object} [options]
   */
  async queueMsgStructBuildCancel(structId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgStructBuildCancel',
      {structId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {string} infuseAmount
   * @param {object} [options]
   */
  async queueMsgStructGeneratorInfuse(structId, infuseAmount, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgStructGeneratorInfuse',
      {structId, infuseAmount},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} owner
   * @param {string} allocationId
   * @param {object} [options]
   */
  async queueMsgSubstationCreate(owner, allocationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationCreate',
      {owner, allocationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} substationId
   * @param {string} name
   * @param {object} [options]
   */
  async queueMsgSubstationUpdateName(substationId, name, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationUpdateName',
      {substationId, name},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} substationId
   * @param {string} pfp
   * @param {object} [options]
   */
  async queueMsgSubstationUpdatePfp(substationId, pfp, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationUpdatePfp',
      {substationId, pfp},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} substationId
   * @param {string} migrationSubstationId
   * @param {object} [options]
   */
  async queueMsgSubstationDelete(substationId, migrationSubstationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationDelete',
      {substationId, migrationSubstationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} allocationId
   * @param {string} destinationId
   * @param {object} [options]
   */
  async queueMsgSubstationAllocationConnect(allocationId, destinationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationAllocationConnect',
      {allocationId, destinationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} allocationId
   * @param {object} [options]
   */
  async queueMsgSubstationAllocationDisconnect(allocationId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationAllocationDisconnect',
      {allocationId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} substationId
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgSubstationPlayerConnect(substationId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationPlayerConnect',
      {substationId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {object} [options]
   */
  async queueMsgSubstationPlayerDisconnect(playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationPlayerDisconnect',
      {playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} substationId
   * @param {string[]} playerId
   * @param {object} [options]
   */
  async queueMsgSubstationPlayerMigrate(substationId, playerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgSubstationPlayerMigrate',
      {substationId, playerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {number} duration
   * @param {number} capacity
   * @param {object} [options]
   */
  async queueMsgAgreementOpen(providerId, duration, capacity, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAgreementOpen',
      {providerId, duration, capacity},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} agreementId
   * @param {object} [options]
   */
  async queueMsgAgreementClose(agreementId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAgreementClose',
      {agreementId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} agreementId
   * @param {number} capacityIncrease
   * @param {object} [options]
   */
  async queueMsgAgreementCapacityIncrease(agreementId, capacityIncrease, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAgreementCapacityIncrease',
      {agreementId, capacityIncrease},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} agreementId
   * @param {number} capacityDecrease
   * @param {object} [options]
   */
  async queueMsgAgreementCapacityDecrease(agreementId, capacityDecrease, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAgreementCapacityDecrease',
      {agreementId, capacityDecrease},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} agreementId
   * @param {number} durationIncrease
   * @param {object} [options]
   */
  async queueMsgAgreementDurationIncrease(agreementId, durationIncrease, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgAgreementDurationIncrease',
      {agreementId, durationIncrease},
      options,
    );
    return this.queue.whenSettled(id);
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
   * @param {object} [options]
   */
  async queueMsgProviderCreate(substationId, rate, accessPolicy, providerCancellationPenalty, consumerCancellationPenalty, capacityMinimum, capacityMaximum, durationMinimum, durationMaximum, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderCreate',
      {
        substationId,
        rate,
        accessPolicy,
        providerCancellationPenalty,
        consumerCancellationPenalty,
        capacityMinimum,
        capacityMaximum,
        durationMinimum,
        durationMaximum,
      },
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {string} destinationAddress
   * @param {object} [options]
   */
  async queueMsgProviderWithdrawBalance(providerId, destinationAddress, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderWithdrawBalance',
      {providerId, destinationAddress},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {number} newMinimumCapacity
   * @param {object} [options]
   */
  async queueMsgProviderUpdateCapacityMinimum(providerId, newMinimumCapacity, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderUpdateCapacityMinimum',
      {providerId, newMinimumCapacity},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {number} newMaximumCapacity
   * @param {object} [options]
   */
  async queueMsgProviderUpdateCapacityMaximum(providerId, newMaximumCapacity, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderUpdateCapacityMaximum',
      {providerId, newMaximumCapacity},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {number} newMinimumDuration
   * @param {object} [options]
   */
  async queueMsgProviderUpdateDurationMinimum(providerId, newMinimumDuration, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderUpdateDurationMinimum',
      {providerId, newMinimumDuration},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {number} newMaximumDuration
   * @param {object} [options]
   */
  async queueMsgProviderUpdateDurationMaximum(providerId, newMaximumDuration, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderUpdateDurationMaximum',
      {providerId, newMaximumDuration},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {string} accessPolicy
   * @param {object} [options]
   */
  async queueMsgProviderUpdateAccessPolicy(providerId, accessPolicy, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderUpdateAccessPolicy',
      {providerId, accessPolicy},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} providerId
   * @param {object} [options]
   */
  async queueMsgProviderDelete(providerId, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgProviderDelete',
      {providerId},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   * @param {object} [options]
   */
  async queueMsgReactorInfuse(delegatorAddress, validatorAddress, amount, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgReactorInfuse',
      {delegatorAddress, validatorAddress, amount},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorSrcAddress
   * @param {string} validatorDstAddress
   * @param {{denom: string, amount: string}} amount
   * @param {object} [options]
   */
  async queueMsgReactorBeginMigration(delegatorAddress, validatorSrcAddress, validatorDstAddress, amount, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgReactorBeginMigration',
      {delegatorAddress, validatorSrcAddress, validatorDstAddress, amount},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   * @param {object} [options]
   */
  async queueMsgReactorDefuse(delegatorAddress, validatorAddress, amount, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgReactorDefuse',
      {delegatorAddress, validatorAddress, amount},
      options,
    );
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} delegatorAddress
   * @param {string} validatorAddress
   * @param {{denom: string, amount: string}} amount
   * @param {number} creationHeight
   * @param {object} [options]
   */
  async queueMsgReactorCancelDefusion(delegatorAddress, validatorAddress, amount, creationHeight, options = {}) {
    const id = this.queue.enqueueImmediate(
      '/structs.structs.MsgReactorCancelDefusion',
      {delegatorAddress, validatorAddress, amount, creationHeight},
      options,
    );
    return this.queue.whenSettled(id);
  }

  // ---------------------------------------------------------------------------
  // Charge-lane messages (broadcast gated until on-chain charge is sufficient)
  //
  // chargeCost is caller-supplied. When chargeCost > 0 we optimistically drain
  // the DISPLAY charge bar (setOptimisticLastActionBlockHeight) for immediate UI
  // feedback; this never touches confirmedLastActionBlockHeight, so the queue
  // scheduler still broadcasts as soon as on-chain charge allows. GRASS
  // (KeyPlayerLastActionListener) remains the sole writer of confirmed lastAction.
  // ---------------------------------------------------------------------------

  /**
   * @param {string} structId
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructActivate(structId, chargeCost, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructActivate',
      {structId},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} playerId
   * @param {number} structTypeId
   * @param {string} operatingAmbit
   * @param {number} slot
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructBuildInitiate(playerId, structTypeId, operatingAmbit, slot, chargeCost, options = {}) {
    const operatingAmbitIndex = AMBIT_ENUM[operatingAmbit.toUpperCase()];
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructBuildInitiate',
      {playerId, structTypeId, operatingAmbit: operatingAmbitIndex, slot},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} defenderStructId
   * @param {string} protectedStructId
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructDefenseSet(defenderStructId, protectedStructId, chargeCost, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructDefenseSet',
      {defenderStructId, protectedStructId},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} defenderStructId
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructDefenseClear(defenderStructId, chargeCost, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructDefenseClear',
      {defenderStructId},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {string} locationType
   * @param {string} ambit
   * @param {number} slot
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructMove(structId, locationType, ambit, slot, chargeCost, options = {}) {
    const locationTypeIndex = LOCATION_TYPE_INDEX[locationType.toLowerCase()];
    const ambitNumber = AMBIT_ENUM[ambit.toUpperCase()];
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructMove',
      {structId, locationType: locationTypeIndex, ambit: ambitNumber, slot},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} operatingStructId
   * @param {string[]} targetStructId
   * @param {string} weaponSystem
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructAttack(operatingStructId, targetStructId, weaponSystem, chargeCost, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructAttack',
      {operatingStructId, targetStructId, weaponSystem},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructStealthActivate(structId, chargeCost, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructStealthActivate',
      {structId},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

  /**
   * @param {string} structId
   * @param {number} chargeCost
   * @param {object} [options]
   */
  async queueMsgStructStealthDeactivate(structId, chargeCost, options = {}) {
    const id = this.queue.enqueueAction(
      '/structs.structs.MsgStructStealthDeactivate',
      {structId},
      chargeCost,
      options,
    );
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
    return this.queue.whenSettled(id);
  }

}