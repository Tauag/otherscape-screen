import type {
	PowerQuestionLetter,
	ThemeType,
	WeaknessQuestionLetter,
} from "../character/types.ts";

export const POWER_LETTERS = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
] as const satisfies readonly PowerQuestionLetter[];

export const WEAKNESS_LETTERS = [
	"A",
	"B",
	"C",
	"D",
] as const satisfies readonly WeaknessQuestionLetter[];

/** Specials a themebook offers. Fallback knows the count, never the text. */
export const SPECIALS_PER_THEMEBOOK = 5;

/** Specials the loadout theme offers, fixed for every pack (core rules, page 134). */
export const LOADOUT_SPECIALS_COUNT = 8;

/** The ids match `themebooks.json`, so a pack upload lines up slot for slot. */
export const FALLBACK_THEMEBOOKS: readonly {
	id: string;
	name: string;
	type: ThemeType;
}[] = [
	{ id: "affiliation", name: "Affiliation", type: "self" },
	{ id: "assets", name: "Assets", type: "self" },
	{ id: "expertise", name: "Expertise", type: "self" },
	{ id: "horizon", name: "Horizon", type: "self" },
	{ id: "personality", name: "Personality", type: "self" },
	{ id: "troubled-past", name: "Troubled Past", type: "self" },
	{ id: "artifact", name: "Artifact", type: "mythos" },
	{ id: "companion", name: "Companion", type: "mythos" },
	{ id: "esoterica", name: "Esoterica", type: "mythos" },
	{ id: "exposure", name: "Exposure", type: "mythos" },
	{ id: "augmentation", name: "Augmentation", type: "noise" },
	{ id: "cutting-edge", name: "Cutting Edge", type: "noise" },
	{ id: "cyberspace", name: "Cyberspace", type: "noise" },
	{ id: "drones", name: "Drones", type: "noise" },
];
