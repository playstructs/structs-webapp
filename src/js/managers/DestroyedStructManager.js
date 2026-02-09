import {Struct} from "../models/Struct";
import {SETTING} from "../constants/SettingConstants";
import {ClearStructTileEvent} from "../events/ClearStructTileEvent";
import {EVENTS} from "../constants/Events";

export class DestroyedStructManager {

  /**
   * @param {GameState} gameState
   * @param {StructManager} structManager
   */
  constructor(gameState, structManager) {
    this.gameState = gameState;
    this.structManager = structManager;
    this.destroyedStructs = {};
  }

  /**
   * @param {string} playerType
   * @param {Struct} struct
   */
  track(playerType, struct) {
    if (struct.isDestroyed()) {
      this.destroyedStructs[struct.id] = {
        playerType: playerType,
        struct: struct
      };
    }
  }

  /**
   * @param {string} playerType
   */
  trackAll(playerType) {
    Object.keys(this.gameState.keyPlayers[playerType].structs).forEach((structId) => {
      this.track(playerType, this.gameState.keyPlayers[playerType].structs[structId]);
    });
  }

  sweep() {
    const sweepDelay = this.gameState.settings.get(SETTING.STRUCT_SWEEP_DELAY);
    const currentBlock = this.gameState.currentBlockHeight;
    const keys = Object.keys(this.destroyedStructs);

    for (let i = 0; i < keys.length; i++) {

      const item = this.destroyedStructs[keys[i]];

      if (item.struct.destroyed_block + sweepDelay < currentBlock) {

        delete(this.destroyedStructs[keys[i]]);
        delete this.gameState.keyPlayers[item.playerType].structs[item.struct.id];

        const mapId = this.structManager.getMapIdByPlayerTypeAndStruct(item.struct, item.playerType);
        const tileType = this.structManager.getTileTypeFromStruct(item.struct);

        if (mapId && tileType) {

          window.dispatchEvent(new ClearStructTileEvent(
            mapId,
            tileType,
            item.struct.operating_ambit.toUpperCase(),
            item.struct.slot,
            item.struct.owner
          ));

        }

      }
    }
  }

  init() {
    window.addEventListener(EVENTS.BLOCK_HEIGHT_CHANGED, () => {
      this.sweep();
    });

    window.addEventListener(EVENTS.TRACK_DESTROYED_STRUCTS, (event) => {
      this.trackAll(event.playerType);
    });

    window.addEventListener(EVENTS.TRACK_DESTROYED_STRUCT, (event) => {
      const struct = this.structManager.getStructById(event.structId);
      if (struct) {
        this.track(event.playerType, struct);
      }
    });
  }

}