// Shared fixtures for the proto suites. Not a suite: test.cjs runs *.test.js only.

/** The public BIP39 test vector; it has no authority outside disposable fixtures. */
export const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

/** An in-memory localStorage with the iteration API the journal uses. */
export function memoryStorage() {
  const values = new Map();
  return {get length() { return values.size; }, key: i => [...values.keys()][i] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)};
}
