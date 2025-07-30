import {Registry} from "@cosmjs/proto-signing";
import {defaultRegistryTypes, SigningStargateClient} from "@cosmjs/stargate";
// noinspection ES6PreferShortImport
import {msgTypes} from "../ts/structs.structs/registry";
import {
  MsgAddressRegister,
  MsgPlanetExplore,
  MsgAddressRevoke,
  MsgFleetMove
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
}