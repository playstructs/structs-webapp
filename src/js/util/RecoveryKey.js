/**
 * Puts a typed or pasted recovery key in the form it was issued in: BIP39
 * words are lowercase and single-spaced, so stray case and whitespace (a
 * capitalised first word, a trailing space from a paste, a line break) are
 * not part of the key.
 *
 * @param {string} recoveryKey
 * @return {string}
 */
export function normalizeRecoveryKey(recoveryKey) {
  return String(recoveryKey ?? '').trim().split(/\s+/).join(' ').toLowerCase();
}
