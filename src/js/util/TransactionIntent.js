import {transferIntent} from "./TransferIntent";
import {reactorIntent} from "./ReactorIntent";
import {generatorIntent} from "./GeneratorIntent";

export function transactionIntent(value) {
  if (value?.kind === 'alpha_transfer') return transferIntent(value);
  if (value?.kind === 'reactor_change') return reactorIntent(value);
  if (value?.kind === 'generator_fund') return generatorIntent(value);
  throw new Error('Unsupported transaction intent');
}
