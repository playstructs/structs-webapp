import {deviceChangeIntent} from "./DeviceChangeIntent";
import {transferIntent} from "./TransferIntent";
import {reactorIntent} from "./ReactorIntent";
import {generatorIntent} from "./GeneratorIntent";
import {gameplayIntent} from "./GameplayIntent";

import {registrationIntent} from "./RegistrationIntent";

export function transactionIntent(value) {
  if (value?.kind === 'gameplay') return gameplayIntent(value);
  if (value?.kind === 'device_change') return deviceChangeIntent(value);
  if (value?.kind === 'address_register') return registrationIntent(value);
  if (value?.kind === 'alpha_transfer') return transferIntent(value);
  if (value?.kind === 'reactor_change') return reactorIntent(value);
  if (value?.kind === 'generator_fund') return generatorIntent(value);
  throw new Error('Unsupported transaction intent');
}
