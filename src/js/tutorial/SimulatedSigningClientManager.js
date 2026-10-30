import {SigningClientManager} from "../managers/SigningClientManager";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {TX_STATUS} from "../models/SigningTransaction";
import {STRUCT_STATUS_FLAGS} from "../constants/StructConstants";

/** How long the simulated chain takes to "include" a transaction. */
const SIMULATED_TX_DELAY_MS = 400;

/**
 * Signing client for the tutorial. It keeps the real message catalog's method
 * names so the real action bar and map can call it, but instead of signing and
 * broadcasting, each message is applied to the TutorialWorld, which reports
 * the outcome back through the regular GRASS listeners.
 */
export class SimulatedSigningClientManager extends SigningClientManager {

  /**
   * @param {GameState} gameState
   * @param {TutorialWorld} world
   */
  constructor(gameState, world) {
    super(gameState);
    this.world = world;

    /**
     * Called after each simulated action is applied, so the tutorial can react.
     *
     * @type {function(string, object): void}
     */
    this.onAction = () => {};

    // Messages the tutorial does not simulate never reach a chain: they are
    // dropped straight away, releasing whatever action the UI was waiting on.
    this.queue.enqueueAction = () => null;
    this.queue.enqueueImmediate = () => null;
    this.queue.enqueueTransfer = () => null;
    this.queue.enqueueReactor = () => null;
    this.queue.enqueueGenerator = () => null;
    this.queue.whenSettled = () => {
      this.gameState.actionBarLock.clear();
      return Promise.resolve({status: TX_STATUS.DROPPED});
    };
  }

  /**
   * @param {function(): object} apply
   * @param {string} action
   * @return {Promise<{status: string}>}
   */
  simulate(action, apply) {
    return new Promise(resolve => {
      setTimeout(() => {
        try {
          const result = apply() || {};
          this.onAction(action, result);
          resolve({status: TX_STATUS.SUCCEEDED});
        } catch (error) {
          console.error(`Tutorial simulation failed to apply ${action}`, error);
          this.gameState.actionBarLock.clear();
          resolve({status: TX_STATUS.DROPPED});
        }
      }, SIMULATED_TX_DELAY_MS);
    });
  }

  /**
   * @param {number} chargeCost
   */
  drainCharge(chargeCost) {
    if (chargeCost > 0) {
      this.gameState.keyPlayers[PLAYER_TYPES.PLAYER]
        .setOptimisticLastActionBlockHeight(this.gameState.currentBlockHeight);
    }
  }

  async initSigningClient() {}

  async resumeCheck() {}

  hasQueuedTransactions() {
    return false;
  }

  async queueMsgStructAttack(structId, targetStructIds, weaponSystem, chargeCost) {
    this.drainCharge(chargeCost);
    return this.simulate('attack', () => {
      const result = this.world.attack(structId, targetStructIds[0], weaponSystem);
      return {...result, attackerId: structId, targetId: targetStructIds[0]};
    });
  }

  async queueMsgStructBuildInitiate(playerId, structTypeId, operatingAmbit, slot, chargeCost) {
    this.drainCharge(chargeCost);
    return this.simulate('build', () => {
      const structId = this.world.initiateBuild(structTypeId, operatingAmbit, slot);
      return {structId, structTypeId};
    });
  }

  async queueMsgStructDefenseSet(defenderStructId, protectedStructId, chargeCost) {
    this.drainCharge(chargeCost);
    return this.simulate('defenseSet', () => {
      this.world.setDefense(defenderStructId, protectedStructId);
      return {defenderStructId, protectedStructId};
    });
  }

  async queueMsgStructDefenseClear(defenderStructId, chargeCost) {
    this.drainCharge(chargeCost);
    return this.simulate('defenseClear', () => {
      this.world.clearDefense(defenderStructId);
      return {defenderStructId};
    });
  }

  async queueMsgStructActivate(structId, chargeCost) {
    this.drainCharge(chargeCost);
    return this.simulate('activate', () => this.setOnline(structId, true));
  }

  async queueMsgStructDeactivate(structId) {
    return this.simulate('deactivate', () => this.setOnline(structId, false));
  }

  /**
   * Moving is not part of the tutorial; the request is acknowledged and dropped.
   */
  async queueMsgStructMove() {
    return this.simulate('move', () => {
      this.gameState.actionBarLock.clear();
    });
  }

  /**
   * @param {string} structId
   * @param {boolean} online
   */
  setOnline(structId, online) {
    const struct = this.world.structs[structId];
    if (!struct) {
      return;
    }
    const statusOld = struct.status;
    if (online) {
      struct.addStatusFlag(STRUCT_STATUS_FLAGS.ONLINE);
    } else {
      struct.removeStatusFlag(STRUCT_STATUS_FLAGS.ONLINE);
    }
    this.world.emit({
      subject: this.world.getSubject(),
      category: 'struct_status',
      detail: {struct_id: structId, status_old: statusOld, status: struct.status},
    });
  }
}
