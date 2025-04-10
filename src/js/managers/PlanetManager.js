//TODO: Awaiting working stargate ts client

import {FEE} from "../constants/Fee";

export class PlanetManager {

  constructor(gameState) {
    this.gameState = gameState;
  }

  async findNewPlanet() {

    const msg = {
      typeUrl: "/di.MsgPlanetExplore",
      value: {
        creator: this.gameState.thisPlayer.primary_address,
        playerId: this.gameState.thisPlayerId
      }
    };

    return await this.gameState.server.client.signAndBroadcast(
      this.gameState.signingAccount.address,
      [msg],
      FEE
    );
  }
}