export function exactAlphaAmount(value) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,77})$/.test(value) || BigInt(value) >= (1n << 256n)) {
    throw new Error('Invalid exact Alpha amount');
  }
  return BigInt(value);
}

/** A user-requested delta on one guild reactor, never an inferred replacement. */
export function reactorIntent(value) {
  const fields = ['kind','version','ownerId','guildId','reactorId','direction','amount'];
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length
      || Object.keys(value).some(key => !fields.includes(key)) || value.kind !== 'reactor_change' || value.version !== 1
      || !['infuse','defuse'].includes(value.direction)) throw new Error('Invalid reactor intent');
  for (const [name,prefix] of [['ownerId','1'],['guildId','0'],['reactorId','3']]) {
    if (typeof value[name] !== 'string' || !new RegExp(`^${prefix}-[1-9][0-9]{0,19}$`).test(value[name])
        || BigInt(value[name].slice(2)) > 18446744073709551615n) throw new Error('Invalid reactor identity');
  }
  const amount = exactAlphaAmount(value.amount);
  if (amount === 0n || amount % 1000000n !== 0n) throw new Error('Reactor change must be positive whole Alpha');
  return Object.freeze({...value});
}
