import {TASK} from "../constants/TaskConstants";

export class DifficultyEstimator {

  /**
   * Calculate difficulty from age
   *
   * @param {number} age - Current age in blocks
   * @param {number} baseDifficultyRange - Base difficulty range
   * @returns {number} Difficulty (number of leading zeros required in hash)
   */
  getCalculatedDifficulty(age, baseDifficultyRange) {
    if (age <= 1) {
      return 64;
    }

    const difficulty = 64 - Math.floor(
        Math.log10(age) / Math.log10(baseDifficultyRange) * 63
    );

    return Math.max(1, difficulty);
  }

  /**
   * Calculate total blocks needed at hash rate 1 (worst case) to break the shield
   *
   * @param {number} blockStartRaid - Block when raid started
   * @param {number} difficultyTarget - Difficulty target (base difficulty range)
   * @return {number} Total blocks needed
   */
  getTotalBlocksNeededAtHashRate1(blockStartRaid, difficultyTarget) {
    const baseDifficultyRange = Math.max(difficultyTarget, 1);
    const maxBlocksToCheck = TASK.MAX_BLOCKS_WHEN_ESTIMATING;
    const blockTimeSeconds = TASK.ESTIMATED_BLOCK_TIME;
    const hashrate = 1; // Worst case

    let cumulativeExpectedSuccesses = 0;
    let blocksAhead = 0;

    // Start from age 0 (blockStartRaid) and calculate forward
    while (cumulativeExpectedSuccesses < 1 && blocksAhead < maxBlocksToCheck) {
      const ageAtBlock = blocksAhead; // Age starts at 0
      const difficulty = this.getCalculatedDifficulty(ageAtBlock, baseDifficultyRange);
      const successProbability = 1 / Math.pow(16, difficulty);

      // Expected number of successful hashes in this block
      const expectedSuccessesInBlock = hashrate * blockTimeSeconds * successProbability;
      cumulativeExpectedSuccesses += expectedSuccessesInBlock;
      blocksAhead++;
    }

    return Math.min(blocksAhead, maxBlocksToCheck);
  }

  /**
   * @param {number} difficultyTarget
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number}
   */
  getRemainingPercent(
    difficultyTarget,
    blockStartRaid,
    currentBlock
  ) {
    // Age represents blocks processed since raid started
    const age = currentBlock - blockStartRaid;

    // If no blocks have passed, shield is at 100%
    if (age <= 0) {
      return 100;
    }

    // Calculate total blocks needed at hash rate 1 (worst case) to break shield
    const totalBlocksNeeded = this.getTotalBlocksNeededAtHashRate1(blockStartRaid, difficultyTarget);

    // Calculate percent complete
    const percentComplete = totalBlocksNeeded > 0 ? age / totalBlocksNeeded : 1.0;

    const remainingPercent = (1 - percentComplete) * 100;

    return Math.ceil(Math.max(remainingPercent, 0));
  }

  /**
   * Estimate the number of blocks remaining before the shield breaks.
   *
   * Mirrors TaskState.getBlockRemainingEstimate: total blocks needed minus the
   * blocks already elapsed since the raid started.
   *
   * @param {number} difficultyTarget
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number} Blocks remaining (0 once the shield is broken)
   */
  getBlockRemainingEstimate(
    difficultyTarget,
    blockStartRaid,
    currentBlock
  ) {
    // Age represents blocks processed since the raid started
    const age = Math.max(currentBlock - blockStartRaid, 0);

    const totalBlocksNeeded = this.getTotalBlocksNeededAtHashRate1(blockStartRaid, difficultyTarget);

    return Math.max(totalBlocksNeeded - age, 0);
  }

  /**
   * Estimate the time remaining before the shield breaks.
   *
   * Mirrors TaskState.getTimeRemainingEstimate by converting the blocks
   * remaining into milliseconds using the estimated block time.
   *
   * @param {number} difficultyTarget
   * @param {number} blockStartRaid
   * @param {number} currentBlock
   * @return {number} Time remaining in milliseconds (0 once the shield is broken)
   */
  getTimeRemainingEstimate(
    difficultyTarget,
    blockStartRaid,
    currentBlock
  ) {
    const blocksRemaining = this.getBlockRemainingEstimate(difficultyTarget, blockStartRaid, currentBlock);
    return blocksRemaining * TASK.ESTIMATED_BLOCK_TIME;
  }
}
