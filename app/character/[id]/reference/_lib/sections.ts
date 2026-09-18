import type { Reference } from "@/lib/content/pack";

/** One cheatsheet line. `cost` is absent in the sections that carry no price. */
export type Row = { name: string; cost?: string; text: string };

export type Section = { title: string; rows: Row[] };

export const sections = (reference: Reference): Section[] => [
	{ title: "Effects", rows: reference.effects },
	{ title: "Mitigation", rows: reference.mitigation },
	{ title: "Scale", rows: reference.scale },
	{ title: "Power options", rows: reference.powerOptions },
];

/**
 * A section whose title matches keeps every row, so a search for "scale" still
 * finds the section when the pack has not filled it.
 *
 * lazy: a substring scan of every row on each keystroke. The ceiling is a pack
 * long enough to drop frames while typing; the upgrade path is
 * `useDeferredValue` around the query.
 */
export function filter(all: Section[], query: string): Section[] {
	const needle = query.trim().toLowerCase();
	if (needle === "") return all;

	return all.flatMap((section) => {
		if (section.title.toLowerCase().includes(needle)) return [section];

		const rows = section.rows.filter((row) =>
			`${row.name} ${row.cost ?? ""} ${row.text}`
				.toLowerCase()
				.includes(needle),
		);
		return rows.length > 0 ? [{ ...section, rows }] : [];
	});
}
