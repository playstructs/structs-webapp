import {Registry} from "@cosmjs/proto-signing";
import {defaultRegistryTypes, SigningStargateClient} from "@cosmjs/stargate";
// noinspection ES6PreferShortImport
import {msgTypes} from "../ts/structs.structs/registry";
import {MsgPlanetExplore} from "../ts/structs.structs/types/structs/structs/tx";

export class SigningClientManager {

  constructor() {
    this.wsUrl = `ws://${window.location.hostname}:26657`;
    this.registry = new Registry([...defaultRegistryTypes, ...msgTypes]);
  }

  async createClient(wallet) {

    console.log("Attempting to create signing client...");
    let client = await SigningStargateClient.connectWithSigner(
      this.wsUrl,
      wallet,
      {
        registry: this.registry,
      },
    );
    console.log("Signing client created");

    return client;
  }

  createMsgPlanetExplore(playerAddress, playerId) {
    return {
      typeUrl: '/structs.structs.MsgPlanetExplore',
      value: MsgPlanetExplore.fromPartial({
        creator: playerAddress,
        playerId: playerId
      }),
    }
  }
}