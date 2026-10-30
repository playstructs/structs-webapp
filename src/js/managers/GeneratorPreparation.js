import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {objectType, planetStatus, techPowerGeneration} from "../ts/structs.structs/types/structs/structs/keys";
import {QueryClientImpl as BankQuery} from "cosmjs-types/cosmos/bank/v1beta1/query";
import {CHAIN} from "../constants/ChainConstants";
import {PERMISSIONS} from "../constants/Permissions";
import {STRUCTS_FREE_GAS} from "../constants/Fee";
import {generatorIntent, generatorObjectId, generatorUint64} from "../util/GeneratorIntent";
import {exactAlphaAmount} from "../util/ReactorIntent";
import {transferAddress} from "../util/TransferIntent";
import {protocolAtHeight} from "../util/ChainProtocol";

/** Mirror the release's target/planet checks without confusing target ownership with spend authority. */
export async function generatorTarget(query, structId, knownPlayer = null) {
  const target = await query.Struct({id:generatorObjectId(structId,'5')});
  const structure = target.Struct;
  if (structure?.id !== structId || target.structAttributes?.isOnline !== true
      || target.structAttributes.isDestroyed !== false) throw new Error('Generator is offline, destroyed or unavailable');
  generatorObjectId(structure.owner,'1');
  generatorUint64(structure.type);
  const type = (await query.StructType({id:structure.type})).StructType;
  if (type?.id !== structure.type || ![techPowerGeneration.smallGenerator,techPowerGeneration.mediumGenerator,
      techPowerGeneration.largeGenerator].includes(type.powerGeneration)) throw new Error('Target cannot consume Alpha');
  generatorUint64(type.generatingRate);
  let planetId;
  if (structure.locationType === objectType.planet) {
    planetId = structure.locationId;
  } else if (structure.locationType === objectType.fleet) {
    // StructCache.GetPlanet resolves a fleet struct via its owner's current
    // fleet. Reuse an already loaded owner when it is the signing player.
    const owner = knownPlayer?.id === structure.owner ? knownPlayer : (await query.Player({id:structure.owner})).Player;
    if (owner?.id !== structure.owner || owner.fleetId !== structure.locationId) throw new Error('Generator fleet owner changed');
    const fleet = (await query.Fleet({id:generatorObjectId(owner.fleetId,'9')})).Fleet;
    if (fleet?.id !== owner.fleetId || fleet.owner !== owner.id || fleet.locationType !== objectType.planet) {
      throw new Error('Generator fleet location is unavailable');
    }
    planetId = fleet.locationId;
  } else { throw new Error('Generator location is unavailable'); }
  const planet = (await query.Planet({id:generatorObjectId(planetId,'2')})).Planet;
  if (planet?.id !== planetId || planet.status !== planetStatus.active) throw new Error('Generator planet is complete or unavailable');
  return {target,type,planetId};
}

/** One indexed-height snapshot, then actual signed simulation before any send. */
export async function prepareGenerator(rpc, tx, indexedPlayer) {
  const intent = generatorIntent(tx.intent);
  const query = new StructsQuery(rpc);
  const actor = await query.Address({address:tx.accountAddress});
  if (actor.address !== tx.accountAddress || actor.playerId !== intent.ownerId
      || (generatorUint64(actor.permissions) & BigInt(PERMISSIONS.TOKEN_INFUSE)) === 0n) {
    throw new Error('Signing address cannot fund a generator');
  }
  const player = (await query.Player({id:intent.ownerId})).Player;
  if (player?.id !== intent.ownerId || indexedPlayer?.id !== intent.ownerId) throw new Error('Generator funding owner changed');
  const {target,type,planetId} = await generatorTarget(query,intent.structId,player);
  const protocol = protocolAtHeight(rpc.chainId,rpc.height);
  let source = transferAddress(player.primaryAddress);
  if (protocol === CHAIN.PROTOCOL) {
    const vault = await query.Vault({ownerId:intent.ownerId});
    if (vault.ownerId !== intent.ownerId || typeof vault.provisioned !== 'boolean') throw new Error('Generator vault is unavailable');
    source = transferAddress(vault.address);
    // A prefunded, unprovisioned vault is valid: this handler calls EnsureVaults.
    if (indexedPlayer.vault_address !== source || indexedPlayer.funds_meta?.ready !== true
        || indexedPlayer.funds_meta.height !== rpc.height) throw new Error('Indexed generator funds are unavailable');
  }
  const requested = generatorUint64(intent.amount);
  if (requested * generatorUint64(type.generatingRate) > 18446744073709551615n) throw new Error('Generator power would overflow');
  const coin = (await new BankQuery(rpc).SpendableBalanceByDenom({address:source,denom:'ualpha'})).balance;
  if (coin?.denom !== 'ualpha' || exactAlphaAmount(coin.amount) < requested) throw new Error('Insufficient spendable generator funds');
  // Existing position fuel/power and deferred generator state are checked by
  // the release handler during simulation. Missing rows are never guessed here.
  return {protocol,message:{typeUrl:'/structs.structs.MsgStructGeneratorInfuse',payload:{structId:intent.structId,infuseAmount:`${intent.amount}ualpha`}},
    fee:{amount:[{denom:'ualpha',amount:'0'}],gas:STRUCTS_FREE_GAS},
    generator:{ownerId:intent.ownerId,structId:target.Struct.id,typeId:type.id,planetId,source,amount:intent.amount,height:rpc.height}};
}
