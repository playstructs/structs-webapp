import {MsgPlayerSend} from "../ts/structs.structs/types/structs/structs/tx";
import {exactAlphaAmount} from "./ReactorIntent";
import {transferAddress} from "./TransferIntent";
import {MAX_ALPHA_SOURCES} from "./AvailableAlpha";

/** Verify the signed collection prefix before checking its final spend message. */
export function verifyVaultFunding(messages, tx, funding, vaultAddress, requested) {
  if (!funding) return 0; // Older submissions have no collection prefix.
  if (funding.vaultAddress !== vaultAddress || !Array.isArray(funding.sources)
      || funding.sources.length > MAX_ALPHA_SOURCES) throw new Error('Invalid vault collection context');
  const vaultBalance = exactAlphaAmount(funding.vaultBalance);
  const shortfall = requested > vaultBalance ? requested - vaultBalance : 0n;
  let collected = 0n;
  let previous = '';
  for (let i = 0; i < funding.sources.length; i++) {
    const source = funding.sources[i];
    const address = transferAddress(source.address);
    const amount = exactAlphaAmount(source.amount);
    if (address === vaultAddress || address <= previous || amount === 0n
        || messages[i]?.typeUrl !== '/structs.structs.MsgPlayerSend') throw new Error('Invalid vault collection source');
    previous = address;
    const signed = MsgPlayerSend.decode(messages[i].value);
    if (signed.creator !== tx.accountAddress || signed.fromAddress !== address || signed.toAddress !== vaultAddress
        || signed.amount.length !== 1 || signed.amount[0].denom !== 'ualpha' || signed.amount[0].amount !== source.amount) {
      throw new Error('Signed vault collection changed');
    }
    collected += amount;
  }
  if (collected !== shortfall) throw new Error('Vault collection differs from the required shortfall');
  return funding.sources.length;
}
