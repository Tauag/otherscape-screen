import type { TierMarks } from "../character/types.ts";

/** Mark a tier. While the target tier is already marked, try one tier higher. */
export function raiseStatus(
	marks: TierMarks,
	tier: number,
	limit: number,
): TierMarks {
	if (!Number.isInteger(tier) || tier < 1 || tier > limit) {
		throw new Error(`Status tier must be 1 to ${limit} (got ${tier}).`);
	}
	const next: TierMarks = [...marks];
	let target = tier;
	while (target <= limit && next[target - 1]) target++;
	if (target > limit) return next; // Pushed off the track, so the status stands.
	next[target - 1] = true;
	return next;
}

/** Move every mark left by `tiers`. A mark pushed below tier 1 is erased. */
export function lowerStatus(marks: TierMarks, tiers: number): TierMarks {
	if (!Number.isInteger(tiers) || tiers < 0) {
		throw new Error(`Status removal must be 0 or more tiers (got ${tiers}).`);
	}
	const next: TierMarks = marks.map(() => false);
	marks.forEach((marked, index) => {
		const moved = index - tiers;
		if (marked && moved >= 0) next[moved] = true;
	});
	return next;
}

/** Mark or clear one tier directly, with no stacking and no shift of the rest. */
export function clearStatusTier(marks: TierMarks, tier: number): TierMarks {
	const next: TierMarks = [...marks];
	next[tier - 1] = false;
	return next;
}

/** Resize the track to a new limit: pad with unmarked tiers, or drop the top ones. */
export function resizeStatusLimit(marks: TierMarks, limit: number): TierMarks {
	const next = marks.slice(0, limit);
	while (next.length < limit) next.push(false);
	return next;
}
