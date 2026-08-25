export const TASK_TYPES = {
  RAID: 'RAID',
  BUILD: 'BUILD',
  MINE: 'MINE',
  REFINE: 'REFINE',
};

/**
 * Task types whose start block is a clock on the planet, shared by every
 * eligible struct standing on it, rather than one held by the struct itself.
 */
export const ORE_TASK_TYPES = [TASK_TYPES.MINE, TASK_TYPES.REFINE];
