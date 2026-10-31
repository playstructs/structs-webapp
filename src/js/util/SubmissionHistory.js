import {submissionBytes} from "./SignedSubmission";

/**
 * An unknown outcome can outlive the need to reserve its signing account.
 * Legacy records have no recoverable signed identity and are never replayed.
 * Current records need a saved native proof that their sequence was consumed.
 * Neither case establishes success or failure of the requested action.
 */
export function isHistoricalSubmission(tx) {
  if (tx?.status !== 'unknown') return false;
  if (!tx.submission && !tx.intent) return true;
  const proof = tx.response;
  if (proof?.stage !== 'sequence_consumed') return false;
  submissionBytes(tx.submission);
  if (proof.chainId !== tx.submission.chainId
      || proof.transactionHash !== tx.submission.hash
      || proof.accountNumber !== tx.submission.accountNumber
      || proof.sequence !== tx.submission.sequence
      || typeof proof.currentSequence !== 'string'
      || !/^(0|[1-9][0-9]{0,19})$/.test(proof.currentSequence)
      || typeof proof.verifiedHeight !== 'string'
      || !/^[1-9][0-9]{0,15}$/.test(proof.verifiedHeight)) {
    throw new Error('Invalid historical submission proof');
  }
  return BigInt(proof.currentSequence) > BigInt(proof.sequence)
    && BigInt(proof.verifiedHeight) >= BigInt(tx.submission.observedHeight);
}
