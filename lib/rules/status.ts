import type { TierMarks } from "../character/types.ts";
import { MAX_STATUS_TIER } from "./constants.ts";

/** Mark a tier. While the target tier is already marked, try one tier higher. */
export function raiseStatus(marks: TierMarks, tier: number): TierMarks {
  if (!Number.isInteger(tier) || tier < 1 || tier > MAX_STATUS_TIER) {
    throw new Error(`Status tier must be 1 to ${MAX_STATUS_TIER} (got ${tier}).`);
  }
  const next: TierMarks = [...marks];
  let target = tier;
  while (target <= MAX_STATUS_TIER && next[target - 1]) target++;
  if (target > MAX_STATUS_TIER) return next; // Pushed off the track, so the status stands.
  next[target - 1] = true;
  return next;
}

/** Move every mark left by `tiers`. A mark pushed below tier 1 is erased. */
export function lowerStatus(marks: TierMarks, tiers: number): TierMarks {
  if (!Number.isInteger(tiers) || tiers < 0) {
    throw new Error(`Status removal must be 0 or more tiers (got ${tiers}).`);
  }
  const next: TierMarks = [false, false, false, false, false, false];
  marks.forEach((marked, index) => {
    const moved = index - tiers;
    if (marked && moved >= 0) next[moved] = true;
  });
  return next;
}
