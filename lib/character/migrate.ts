import { DEFAULT_STATUS_LIMIT } from "../rules/constants.ts";
import type { Character } from "./types.ts";

export const CURRENT_SCHEMA_VERSION = 8;

type Doc = Record<string, unknown>;

/** A step upgrades a version-n document to version n+1. */
type Step = (doc: Doc) => Doc;

// Adding a version is one entry here plus a bump of CURRENT_SCHEMA_VERSION.
// migrate sets schema_version itself, so a step only reshapes fields.
const steps = new Map<number, Step>();

// v1 predates essenceChosen: reducer.ts's autoEssence overwrote `essence`
// once, on whichever addTheme first reached 4 themes, then never touched it
// again - the exact staleness essenceChosen exists to fix. A v1 document's
// existing value is therefore never a real choice, only the old code's one-shot
// guess, so it starts unchosen and goes back to tracking the theme mix live.
steps.set(1, (doc) => ({ ...doc, essenceChosen: false }));

// v2 predates the Loadout Set rewrite: the loadout used to group tags under
// the character's core themes (themeIds + a flat tag list), which was never
// how the rules actually work. The old shape has no title/feature split to
// convert, so this step resets the loadout rather than guessing at one; the
// budget fields it already tracked correctly carry over.
steps.set(2, (doc) => {
	const old = (doc.loadout ?? {}) as Doc;
	return {
		...doc,
		loadout: {
			sets: [],
			wildcards: 0,
			specials: old.specials ?? [],
			availablePower: old.availablePower ?? 1,
			upgrade: old.upgrade ?? 0,
		},
	};
});

// v3 predates the crew theme: every character now carries their own copy of
// the crew's theme alongside loadout (constants.ts's STARTING_THEMES comment
// already carved out the exclusion). A v3 document has none, so this step
// adds a blank one.
steps.set(3, (doc) => ({
	...doc,
	crewTheme: {
		powerTags: [],
		weaknessTags: [],
		motivation: "Identity",
		quote: "",
		specials: [],
		upgrade: 0,
		decay: 0,
	},
}));

// v4 predates two rule fixes: a status's owner (mine/MC) never belonged on the
// character sheet at all - a status is the character's, full stop, and MC
// ownership is a session-level concern for later GM tooling (PRD 10) - so it
// is dropped rather than converted. And a story tag's scratched flag conflated
// "spent" with "out of play forever"; it is replaced by burnt (like a power
// tag, reversible) and crispy (one-time, deletes itself on use). A v4 tag that
// was scratched has no equivalent state to carry forward, so it comes back
// as a normal, usable tag.
steps.set(4, (doc) => {
	const statuses = (doc.statuses ?? []) as Record<string, unknown>[];
	const storyTags = (doc.storyTags ?? []) as Record<string, unknown>[];
	return {
		...doc,
		statuses: statuses.map((status) => {
			const { owner: _owner, ...rest } = status;
			return { ...rest, limit: DEFAULT_STATUS_LIMIT };
		}),
		storyTags: storyTags.map((tag) => {
			const { scratched: _scratched, ...rest } = tag;
			return { ...rest, burnt: false, crispy: false };
		}),
	};
});

// v5 drops a status's "out" flag: marking a status merely inactive, rather
// than lowering or deleting it, turned out not to earn its keep as a
// separate state, so there is nothing to carry forward.
steps.set(5, (doc) => {
	const statuses = (doc.statuses ?? []) as Record<string, unknown>[];
	return {
		...doc,
		statuses: statuses.map((status) => {
			const { out: _out, ...rest } = status;
			return rest;
		}),
	};
});

// v6 predates a crew relationship's burnt flag: a relationship tag can now
// carry Power in a roll, crispy like every other crew tag, so it needs the
// same reversible burnt state a crew power tag already has. A v6 document's
// relationships were never burnt, since nothing could burn them yet.
steps.set(6, (doc) => {
	const crew = (doc.crew ?? []) as Record<string, unknown>[];
	return {
		...doc,
		crew: crew.map((relationship) => ({ ...relationship, burnt: false })),
	};
});

// v7 predates the Evolution track's five circles: a v7 document has Moments
// of Evolution but nothing counting the points that build toward one, so this
// step starts the track empty.
steps.set(7, (doc) => ({ ...doc, evolutionPoints: 0 }));

/**
 * Upgrade a document read from the database. This is a trust boundary, so it
 * fails loudly rather than handing a wrong shape to the reducer.
 *
 * lazy: the field shapes inside the document are not checked, so a truncated or
 * hand-edited row still passes. Upgrade path: a per-version validator run at the
 * end of this function, either hand-written or Zod.
 */
export function migrate(doc: unknown): Character {
	if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
		throw new Error(
			`Character document is not an object (got ${typeName(doc)}).`,
		);
	}

	let current = doc as Doc;
	const version = current.schema_version;

	if (
		typeof version !== "number" ||
		!Number.isInteger(version) ||
		version < 1
	) {
		throw new Error(
			`Character document has no usable schema_version (got ${JSON.stringify(version) ?? typeName(version)}).`,
		);
	}

	if (version > CURRENT_SCHEMA_VERSION) {
		throw new Error(
			`Character document is schema_version ${version}, newer than this client reads (${CURRENT_SCHEMA_VERSION}). Reload to get the newer client.`,
		);
	}

	for (let from = version; from < CURRENT_SCHEMA_VERSION; from++) {
		const step = steps.get(from);
		if (!step) {
			throw new Error(
				`No migration step from schema_version ${from} to ${from + 1}.`,
			);
		}
		current = { ...step(current), schema_version: from + 1 };
	}

	return current as unknown as Character;
}

function typeName(value: unknown): string {
	if (value === null) return "null";
	return Array.isArray(value) ? "array" : typeof value;
}
