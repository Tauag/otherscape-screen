import type { PowerTag, ThemeType, Valence } from "../character/types.ts";
import { DEFAULT_BURN_VALUE } from "./constants.ts";

export type PowerLine = { label: string; value: number; counted: boolean };

export type PowerBreakdown = { lines: PowerLine[]; total: number };

export type SelectedTag = {
	label: string;
	valence: Valence;
	/** The Power this tag burns for, or null and absent when it does not burn. */
	burnValue?: number | null;
};

export type SelectedStatus = { label: string; valence: Valence; tier: number };

export type RollSelection = {
	tags: SelectedTag[];
	statuses: SelectedStatus[];
	modifier: number;
	rollWith?: { type: ThemeType; themeCount: number } | null;
};

const ROLL_WITH_LABEL: Record<ThemeType, string> = {
	self: "Rolling with Self",
	mythos: "Rolling with Mythos",
	noise: "Rolling with Noise",
};

/** The burn value a selected tag carries, or null when the tag is not burnt. */
export function burnValueOf(
	tag: Pick<PowerTag, "burnt" | "burnValue">,
): number | null {
	return tag.burnt ? (tag.burnValue ?? DEFAULT_BURN_VALUE) : null;
}

/**
 * Break a roll selection into labelled lines plus the total. The breakdown is
 * the product, not the total, because design.md prints the arithmetic and the
 * uncounted lines struck through.
 */
export function power(selection: RollSelection): PowerBreakdown {
	const { tags, statuses, modifier, rollWith } = selection;
	const lines: PowerLine[] = [];

	if (rollWith) {
		lines.push({
			label: ROLL_WITH_LABEL[rollWith.type],
			value: rollWith.themeCount,
			counted: true,
		});
	}

	for (const tag of tags) {
		if (tag.valence === "negative") {
			lines.push({ label: tag.label, value: -1, counted: true });
			continue;
		}
		// Rolling with a domain replaces the positive tags and forbids a burn (O1),
		// so the line keeps the plain value it would have had.
		const burn = rollWith ? null : (tag.burnValue ?? null);
		lines.push({ label: tag.label, value: burn ?? 1, counted: !rollWith });
	}

	const best = { positive: -1, negative: -1 };
	for (const status of statuses) {
		if (status.tier > best[status.valence]) best[status.valence] = status.tier;
	}
	const counted = { positive: false, negative: false };
	for (const status of statuses) {
		// A tie goes to the first in input order, so the second one is struck through.
		const counts =
			status.tier === best[status.valence] && !counted[status.valence];
		counted[status.valence] = counted[status.valence] || counts;
		lines.push({
			label: status.label,
			value: status.valence === "negative" ? -status.tier : status.tier,
			counted: counts,
		});
	}

	if (modifier !== 0) {
		lines.push({ label: "Modifier", value: modifier, counted: true });
	}

	const total = lines.reduce(
		(sum, line) => (line.counted ? sum + line.value : sum),
		0,
	);
	return { lines, total };
}
