import {QueryClientImpl as StructsQuery} from "../ts/structs.structs/types/structs/structs/query";
import {QueryClientImpl as BankQuery} from "cosmjs-types/cosmos/bank/v1beta1/query";
import {CHAIN} from "../constants/ChainConstants";
import {PERMISSIONS} from "../constants/Permissions";
import {generatorTarget} from "./GeneratorPreparation";
import {generatorUint64} from "../util/GeneratorIntent";
import {generatorState} from "../util/GeneratorState";
import {transferAddress} from "../util/TransferIntent";
import {validateSigningSnapshot} from "../util/ChainProtocol";
import {readVaultFunding} from "./VaultFunding";

/** Same-height native facts and indexed positions; submission checks again. */
export async function readGeneratorSnapshot(rpc, indexed, ownerId, structId, accountAddress, indexedPlayer = null) {
  const signing = validateSigningSnapshot(indexed?.snapshot_meta,{chainId:rpc.chainId,height:rpc.height},['inventory']);
  const query = new StructsQuery(rpc);
  const actor = await query.Address({address:accountAddress});
  if (actor.address !== accountAddress || actor.playerId !== ownerId
      || (generatorUint64(actor.permissions) & BigInt(PERMISSIONS.TOKEN_INFUSE)) === 0n) throw new Error('Signing address cannot fund a generator');
  const player = (await query.Player({id:ownerId})).Player;
  if (player?.id !== ownerId) throw new Error('Generator funding owner changed');
  const {type,planetId} = await generatorTarget(query,structId,player);
  let source = transferAddress(player.primaryAddress);
  if (signing.protocol === CHAIN.PROTOCOL) {
    const vault = await query.Vault({ownerId});
    if (vault.ownerId !== ownerId || typeof vault.provisioned !== 'boolean') throw new Error('Generator vault unavailable');
    source = transferAddress(vault.address);
  }
  let funds;
  if (signing.protocol === CHAIN.PROTOCOL && indexedPlayer) {
    validateSigningSnapshot(indexedPlayer.snapshot_meta, {chainId:rpc.chainId, height:rpc.height}, ['inventory']);
    if (indexedPlayer.id !== ownerId || indexedPlayer.vault_address !== source) {
      throw new Error('Generator funding owner changed');
    }
    funds = (await readVaultFunding(rpc, ownerId, source, actor, indexedPlayer)).total.toString();
  } else {
    const coin = (await new BankQuery(rpc).SpendableBalanceByDenom({address:source,denom:'ualpha'})).balance;
    if (coin?.denom !== 'ualpha') throw new Error('Generator spendability unavailable');
    funds = coin.amount;
  }
  return generatorState(indexed,{ownerId,structId,planetId,source,protocol:signing.protocol,height:rpc.height,
    rate:type.generatingRate,funds});
}
