import type { Loadout } from "../character/types.ts";
import { LOADOUT_TAG_COST, WILDCARD_TAG_COST } from "./constants.ts";

export function loadoutSpend(loadout: Loadout): {
	spent: number;
	available: number;
	over: number;
	warning: string | null;
} {
	// Weaknesses are never charged, loaded or not, so they're left out entirely.
	const setsSpend = loadout.sets.reduce((total, set) => {
		const title = set.titleLoaded ? LOADOUT_TAG_COST : 0;
		const features =
			set.features.filter((feature) => feature.loaded).length *
			LOADOUT_TAG_COST;
		return total + title + features;
	}, 0);
	const spent = setsSpend + loadout.wildcards * WILDCARD_TAG_COST;
	const available = loadout.availablePower;
	const over = Math.max(0, spent - available);
	return {
		spent,
		available,
		over,
		warning:
			over > 0
				? `You have ${spent} out of ${available} power available.`
				: null,
	};
}
