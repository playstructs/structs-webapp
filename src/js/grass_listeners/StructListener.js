import {AbstractGrassListener} from "../framework/AbstractGrassListener";
import {TaskStateFactory} from "../factories/TaskStateFactory";
import {TASK_TYPES} from "../constants/TaskTypes";
import {TaskCmdKillEvent} from "../events/TaskCmdKillEvent";
import {TaskCmdSpawnEvent} from "../events/TaskCmdSpawnEvent";
import {STRUCT_ACTIONS, STRUCT_STATUS_FLAGS} from "../constants/StructConstants";
import {PLAYER_TYPES} from "../constants/PlayerTypes";
import {ClearStructTileEvent} from "../events/ClearStructTileEvent";
import {UpdateTileStructIdEvent} from "../events/UpdateTileStructIdEvent";
import {AnimationEventFactory} from "../factories/AnimationEventFactory";
import {AnimationEvent} from "../events/AnimationEvent";
import {ANIMATION} from "../constants/AnimationConstants";

export class StructListener extends AbstractGrassListener {

  /**
   * @param {GameState} gameState
   * @param {GuildAPI} guildAPI
   * @param {StructManager} structManager
   * @param {string} targetPlayerType - The player type whose planet this listener monitors
   */
  constructor(
    gameState,
    guildAPI,
    structManager,
    targetPlayerType = PLAYER_TYPES.PLAYER
  ) {
    super('STRUCT_CHANGE');
    this.gameState = gameState;
    this.guildAPI = guildAPI;
    this.structManager = structManager;
    this.targetPlayerType = targetPlayerType;
    this.animationEventFactory = new AnimationEventFactory();
  }

  /**
   * Get the player type for a given owner ID.
   * @param {string} ownerId
   * @returns {string|null}
   */
  getOwnerPlayerType(ownerId) {
    for (const playerType of Object.values(PLAYER_TYPES)) {
      if (this.gameState.keyPlayers[playerType].id === ownerId) {
        return playerType;
      }
    }
    return null;
  }

  /**
   * Determines if this listener should be unregistered.
   * For RAID_ENEMY listeners, unregister when the raid is no longer active.
   * @returns {boolean}
   */
  shouldUnregister() {
    if (this.gameState.keyPlayers[this.targetPlayerType].isRaidDependent()) {
      return !this.gameState.getPlanetRaidInfoForKeyPlayer(this.targetPlayerType)?.isRaidActive();
    }
    return false;
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructBlockBuildStart(subject, messageData) {
    if (!(
      messageData.category === 'struct_block_build_start'
      && messageData.subject === subject
      && messageData.detail.block > 0
    )) {
      return;
    }

    this.structManager.refreshStruct(
      messageData.detail.struct_id,
      this.gameState.keyPlayers[this.targetPlayerType].planetMapType
    ).then((struct) => {

      if (struct && this.getOwnerPlayerType(struct.owner) === PLAYER_TYPES.PLAYER) {
        window.dispatchEvent(new TaskCmdSpawnEvent(new TaskStateFactory().initStructTask(
          messageData.detail.struct_id,
          TASK_TYPES.BUILD,
          messageData.detail.block,
          this.gameState.structTypes.getStructTypeById(struct.type).build_difficulty
        )));
      }

    });
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructStatus(subject, messageData) {
    if (!(
      messageData.category === 'struct_status'
      && messageData.subject === subject
    )) {
      return;
    }

    let removePendingBuild = false;
    let renderStruct = true;
    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;
    const mapId = this.gameState[mapType]?.mapId ?? null;

    if (
      (messageData.detail.status_old & STRUCT_STATUS_FLAGS.BUILT) === 0
      && (messageData.detail.status & STRUCT_STATUS_FLAGS.BUILT) > 0
    ) {
      removePendingBuild = true;

    } else if (
      (messageData.detail.status_old & STRUCT_STATUS_FLAGS.HIDDEN) === 0
      && (messageData.detail.status & STRUCT_STATUS_FLAGS.HIDDEN) > 0
    ) {
      renderStruct = false;
      const animationEvent = this.animationEventFactory.makeStealthActivateAnimationEvent(
        messageData.detail.struct_id,
        mapId
      );
      this.gameState.animationEventQueue.enqueue(animationEvent);

    } else if (
      (messageData.detail.status_old & STRUCT_STATUS_FLAGS.HIDDEN) > 0
      && (messageData.detail.status & STRUCT_STATUS_FLAGS.HIDDEN) === 0
    ) {
      renderStruct = false;
      const animationEvent = this.animationEventFactory.makeStealthDeactivateAnimationEvent(
        messageData.detail.struct_id,
        mapId
      );
      this.gameState.animationEventQueue.enqueue(animationEvent);
    }

    this.structManager.refreshStruct(
      messageData.detail.struct_id,
      mapType,
      removePendingBuild,
      renderStruct
    ).then((struct) => {

      this.gameState.actionBarLock.clear();

      // Only kill build tasks for the player's own structs
      if (
        removePendingBuild
        && struct
        && (struct.owner === this.gameState.keyPlayers[PLAYER_TYPES.PLAYER].id)
      ) {
        window.dispatchEvent(new TaskCmdKillEvent(messageData.detail.struct_id));
      }
    });
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructMove(subject, messageData) {
    if (!(
      messageData.category === 'struct_move'
      && messageData.subject === subject
    )) {
      return;
    }

    const structId = messageData.detail.struct_id;
    const oldStruct = this.structManager.getStructById(structId);
    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;
    const mapId = this.gameState[mapType]?.mapId;

    // 1. Enqueue depart animation
    const departEvent = new AnimationEvent(
      structId,
      [ANIMATION.NAMES.MOVE.DEPART],
      false,
      false,
      {},
      mapId ?? null
    );

    departEvent.onAnimationEnd = async () => {
      if (oldStruct && mapId) {
        const oldTileType = this.structManager.getTileTypeFromStruct(oldStruct);
        const oldAmbit = oldStruct.operating_ambit.toUpperCase();

        window.dispatchEvent(new ClearStructTileEvent(
          mapId, oldTileType, oldAmbit, oldStruct.slot, oldStruct.owner
        ));
        window.dispatchEvent(new UpdateTileStructIdEvent(
          mapId, oldTileType, oldAmbit, oldStruct.slot, oldStruct.owner, ''
        ));
      }

      await this.structManager.refreshStruct(structId, mapType);
    };

    this.gameState.animationEventQueue.enqueue(departEvent);

    // 2. Enqueue arrive animation (plays after depart + side effects complete)
    const arriveEvent = new AnimationEvent(
      structId,
      [ANIMATION.NAMES.MOVE.ARRIVE],
      false,
      true,
      {},
      mapId ?? null
    );

    arriveEvent.onAnimationEnd = () => {
      this.gameState.actionBarLock.clear();
    };

    this.gameState.animationEventQueue.enqueue(arriveEvent);
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructDefenseAdd(subject, messageData) {
    if (!(
      messageData.category === 'struct_defense_add'
      && messageData.subject === subject
    )) {
      return;
    }

    const defenderStructId = messageData.detail.defender_struct_id;
    const protectedStructId = messageData.detail.protected_struct_id;
    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;

    // Refresh both the defender and protected structs
    Promise.all([
      this.structManager.refreshStruct(defenderStructId, mapType, false, false),
      this.structManager.refreshStruct(protectedStructId, mapType, false, false)
    ]).then(() => {
      // Only clear actionBarLock if this was triggered by the current player's action
      if (
        this.gameState.actionBarLock.getCurrentAction() === STRUCT_ACTIONS.DEFENSE_SET
        && this.gameState.actionBarLock.isLocked()
      ) {
        this.gameState.actionBarLock.clear();
      }
    });
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructDefenseRemove(subject, messageData) {
    if (!(
      messageData.category === 'struct_defense_remove'
      && messageData.subject === subject
    )) {
      return;
    }

    const defenderStructId = messageData.detail.defender_struct_id;
    const protectedStructId = messageData.detail.protected_struct_id;
    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;

    // Refresh both the defender and protected structs
    Promise.all([
      this.structManager.refreshStruct(defenderStructId, mapType, false, false),
      this.structManager.refreshStruct(protectedStructId, mapType, false, false)
    ]).then(() => {
      // Only clear actionBarLock if this was triggered by the current player's action
      if (
        this.gameState.actionBarLock.getCurrentAction() === STRUCT_ACTIONS.DEFENSE_CLEAR
        && this.gameState.actionBarLock.isLocked()
      ) {
        this.gameState.actionBarLock.clear();
      }
    });
  }

  /**
   * @param {string} subject
   * @param {object} messageData
   */
  handleStructAttack(subject, messageData) {
    if (!(
      messageData.category === 'struct_attack'
      && messageData.subject === subject
    )) {
      return;
    }

    const mapType = this.gameState.keyPlayers[this.targetPlayerType].planetMapType;
    const mapId = this.gameState[mapType]?.mapId ?? null;
    const structIdsToRefresh = new Set();

    structIdsToRefresh.add(messageData.detail.attackerStructId);

    for (let i = 0; i < messageData.detail.eventAttackShotDetail.length; i++) {

      const eventAttackShotDetail = messageData.detail.eventAttackShotDetail[i];

      let defenderCounterDestroyedAttacker = false;

      for (let j = 0; j < eventAttackShotDetail.eventAttackDefenderCounterDetail.length; j++) {

        const eventAttackDefenderCounterDetail = eventAttackShotDetail.eventAttackDefenderCounterDetail[j];

        // i. Play counterByStruct attack animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeAttackAnimationEvent(
            eventAttackDefenderCounterDetail.counterByStructId,
            eventAttackDefenderCounterDetail.counterByStructWeaponSystem,
            mapId
          )
        );

        // ii. Play attackerStruct receiving damage animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeReceiveDamageAnimationEvent(
            messageData.detail.attackerStructId,
            eventAttackDefenderCounterDetail.counterByStructType,
            eventAttackDefenderCounterDetail.counterByStructOperatingAmbit,
            eventAttackDefenderCounterDetail.counterByStructWeaponSystem,
            messageData.detail.attackerStructType,
            messageData.detail.attackerStructOperatingAmbit,
            messageData.detail.attackerStructLocationType,
            messageData.detail.attackerHealthMax,
            messageData.detail.attackerHealthBefore,
            messageData.detail.attackerHealthAfter,
            false,
            '',
            mapId
          )
        );

        if (eventAttackDefenderCounterDetail.counterDestroyedAttacker) {
          this.gameState.animationEventQueue.enqueue(
            this.animationEventFactory.makeDestroyAnimationEvent(
              messageData.detail.attackerStructId,
              messageData.detail.attackerStructOperatingAmbit,
              mapId
            )
          );

          defenderCounterDestroyedAttacker = true;
          break;
        }
      }

      if (!defenderCounterDestroyedAttacker) {
        // b. If not counterDestroyedAttacker, play attackerStruct attack animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeAttackAnimationEvent(
            messageData.detail.attackerStructId,
            messageData.detail.weaponSystem,
            mapId
          )
        );
      }

      if (eventAttackShotDetail.evaded) {
        // c. If evaded, play targetStruct evade animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeReceiveDamageAnimationEvent(
            eventAttackShotDetail.targetStructId,
            messageData.detail.attackerStructType,
            messageData.detail.attackerStructOperatingAmbit,
            messageData.detail.weaponSystem,
            eventAttackShotDetail.targetStructType,
            eventAttackShotDetail.targetStructOperatingAmbit,
            eventAttackShotDetail.targetStructLocationType,
            eventAttackShotDetail.targetHealthMax,
            eventAttackShotDetail.targetHealthBefore,
            eventAttackShotDetail.targetHealthAfter,
            eventAttackShotDetail.evaded,
            eventAttackShotDetail.evadedCause,
            mapId
          )
        );
      }

      if (eventAttackShotDetail.blocked) {
        // d. If blocked, play blockedByStruct receiving damage animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeReceiveDamageAnimationEvent(
            eventAttackShotDetail.blockedByStructId,
            messageData.detail.attackerStructType,
            messageData.detail.attackerStructOperatingAmbit,
            messageData.detail.weaponSystem,
            eventAttackShotDetail.blockedByStructType,
            eventAttackShotDetail.blockedByStructOperatingAmbit,
            eventAttackShotDetail.blockedByStructLocationType,
            eventAttackShotDetail.blockerHealthMax,
            eventAttackShotDetail.blockerHealthBefore,
            eventAttackShotDetail.blockerHealthAfter,
            false,
            '',
            mapId
          )
        );

        if (eventAttackShotDetail.blockerDestroyed) {
          this.gameState.animationEventQueue.enqueue(
            this.animationEventFactory.makeDestroyAnimationEvent(
              eventAttackShotDetail.blockedByStructId,
              eventAttackShotDetail.blockedByStructOperatingAmbit,
              mapId
            )
          );
        }

        structIdsToRefresh.add(eventAttackShotDetail.blockedByStructId);
      }

      if (parseInt(eventAttackShotDetail.targetHealthBefore) !== parseInt(eventAttackShotDetail.targetHealthAfter)) {
        // e. If targetHealthBefore !== targetHealthAfter, play targetStruct receive damage animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeReceiveDamageAnimationEvent(
            eventAttackShotDetail.targetStructId,
            messageData.detail.attackerStructType,
            messageData.detail.attackerStructOperatingAmbit,
            messageData.detail.weaponSystem,
            eventAttackShotDetail.targetStructType,
            eventAttackShotDetail.targetStructOperatingAmbit,
            eventAttackShotDetail.targetStructLocationType,
            eventAttackShotDetail.targetHealthMax,
            eventAttackShotDetail.targetHealthBefore,
            eventAttackShotDetail.targetHealthAfter,
            false,
            '',
            mapId
          )
        );

        if (eventAttackShotDetail.targetDestroyed) {
          this.gameState.animationEventQueue.enqueue(
            this.animationEventFactory.makeDestroyAnimationEvent(
              eventAttackShotDetail.targetStructId,
              eventAttackShotDetail.targetStructOperatingAmbit,
              mapId
            )
          );
        }

        structIdsToRefresh.add(eventAttackShotDetail.targetStructId);
      }

      if (!eventAttackShotDetail.targetDestroyed && eventAttackShotDetail.targetCountered) {
        // f. If targetHealthAfter > 0 and targetCountered, play targetStruct attack animation
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeAttackAnimationEvent(
            eventAttackShotDetail.targetStructId,
            eventAttackShotDetail.targetCounterWeaponSystem,
            mapId
          )
        );

        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeReceiveDamageAnimationEvent(
            messageData.detail.attackerStructId,
            eventAttackShotDetail.targetStructType,
            eventAttackShotDetail.targetStructOperatingAmbit,
            eventAttackShotDetail.targetCounterWeaponSystem,
            messageData.detail.attackerStructType,
            messageData.detail.attackerStructOperatingAmbit,
            messageData.detail.attackerStructLocationType,
            messageData.detail.attackerHealthMax,
            messageData.detail.attackerHealthBefore,
            messageData.detail.attackerHealthAfter,
            false,
            '',
            mapId
          )
        );
      }

      if (eventAttackShotDetail.targetCounterDestroyedAttacker) {
        this.gameState.animationEventQueue.enqueue(
          this.animationEventFactory.makeDestroyAnimationEvent(
            messageData.detail.attackerStructId,
            messageData.detail.attackerStructOperatingAmbit,
            mapId
          )
        );
      }
    }

    // Refresh all involved structs
    const refreshPromises = Array.from(structIdsToRefresh).map(
      structId => this.structManager.refreshStruct(structId, mapType, false, false)
    );

    Promise.all(refreshPromises).then(() => {
      // Only clear actionBarLock if this was triggered by the current player's attack action
      if (
        (this.gameState.actionBarLock.getCurrentAction() === STRUCT_ACTIONS.ATTACK_PRIMARY_WEAPON
          || this.gameState.actionBarLock.getCurrentAction() === STRUCT_ACTIONS.ATTACK_SECONDARY_WEAPON)
        && this.gameState.actionBarLock.isLocked()
      ) {
        this.gameState.actionBarLock.clear();
      }
    });
  }

  handler(messageData) {
    const targetPlanetId = this.gameState.keyPlayers[this.targetPlayerType].getPlanetId();

    // Skip if we don't have a target planet ID yet
    if (!targetPlanetId) {
      return;
    }

    const subject = `structs.planet.${targetPlanetId}`;

    this.handleStructBlockBuildStart(subject, messageData);
    this.handleStructStatus(subject, messageData);
    this.handleStructMove(subject, messageData);
    this.handleStructDefenseAdd(subject, messageData);
    this.handleStructDefenseRemove(subject, messageData);
    this.handleStructAttack(subject, messageData);
  }
}
