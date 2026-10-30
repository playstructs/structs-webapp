import {transferIntent} from "./TransferIntent";
import {reactorIntent} from "./ReactorIntent";

export function transactionIntent(value) {
  if (value?.kind === 'alpha_transfer') return transferIntent(value);
  if (value?.kind === 'reactor_change') return reactorIntent(value);
  throw new Error('Unsupported transaction intent');
}
