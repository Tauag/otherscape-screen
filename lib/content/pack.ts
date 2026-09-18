import type {
	PowerQuestionLetter,
	ThemeType,
	WeaknessQuestionLetter,
} from "../character/types.ts";
import {
	CREW_THEME_SPECIALS_COUNT,
	EFFECT_NAMES,
	FALLBACK_THEMEBOOKS,
	LOADOUT_SPECIALS_COUNT,
	POWER_LETTERS,
	POWER_OPTION_NAMES,
	SPECIALS_PER_THEMEBOOK,
	WEAKNESS_LETTERS,
} from "./fallback.ts";

export type Question<L> = { letter: L; text: string };

export type Special = { name: string; text: string };

export type Themebook = {
	id: string;
	name: string;
	type: ThemeType;
	summary: string;
	concept: string;
	/** Always the ten letters, in order. */
	powerQuestions: Question<PowerQuestionLetter>[];
	/** Always the four letters, in order. */
	weaknessQuestions: Question<WeaknessQuestionLetter>[];
	/** Always five. */
	specials: Special[];
};

/** The crew theme's own content (core rules, page 75): no themebook to hold it. */
export type CrewThemeContent = {
	/** Always the ten letters, in order. */
	powerQuestions: Question<PowerQuestionLetter>[];
	/** Always the four letters, in order. */
	weaknessQuestions: Question<WeaknessQuestionLetter>[];
	/** Always five. */
	specials: Special[];
};

/** A Special that also carries a Power price: an effect, or a mitigation. */
export type Priced = Special & { cost: string };

/** The cheatsheet the Reference screen prints (PRD 7.10). */
export type Reference = {
	/** Always the twelve effects, in order. */
	effects: Priced[];
	mitigation: Priced[];
	/** One row per Scale step. The pack decides how many; the fallback knows none. */
	scale: Special[];
	powerOptions: Special[];
};

export type ContentPack = {
	themebooks: Themebook[];
	/** The loadout theme's own specials (core rules, page 134). Always eight. */
	loadoutSpecials: Special[];
	crewTheme: CrewThemeContent;
	reference: Reference;
};

/** What a tag editor prints over a blank field: "power tag question B". */
export const questionLabel = (kind: "power" | "weakness", letter: string) =>
	`${kind} tag question ${letter}`;

export const themebooksOfType = (pack: ContentPack, type: ThemeType) =>
	pack.themebooks.filter((book) => book.type === type);

/** A theme stores its themebook as free text, so a name matches as well as an id. */
export const findThemebook = (pack: ContentPack, idOrName: string) =>
	pack.themebooks.find(
		(book) =>
			book.id === idOrName ||
			book.name.toLowerCase() === idOrName.trim().toLowerCase(),
	) ?? null;

const empty = <L>(letters: readonly L[]): Question<L>[] =>
	letters.map((letter) => ({ letter, text: "" }));

const emptySpecials = (count: number): Special[] =>
	Array.from({ length: count }, () => ({ name: "", text: "" }));

/**
 * Names only. The costs, the Scale steps, and every rule sentence live in the
 * printed CHEATSHEET, so the pack carries them and the screen shows the blank
 * slots until it does (design.md, interface decision 5).
 */
export const FALLBACK_REFERENCE: Reference = {
	effects: EFFECT_NAMES.map((name) => ({ name, cost: "", text: "" })),
	mitigation: [],
	scale: [],
	powerOptions: POWER_OPTION_NAMES.map((name) => ({ name, text: "" })),
};

export const FALLBACK_PACK: ContentPack = {
	themebooks: FALLBACK_THEMEBOOKS.map((book) => ({
		...book,
		summary: "",
		concept: "",
		powerQuestions: empty(POWER_LETTERS),
		weaknessQuestions: empty(WEAKNESS_LETTERS),
		specials: emptySpecials(SPECIALS_PER_THEMEBOOK),
	})),
	loadoutSpecials: emptySpecials(LOADOUT_SPECIALS_COUNT),
	crewTheme: {
		powerQuestions: empty(POWER_LETTERS),
		weaknessQuestions: empty(WEAKNESS_LETTERS),
		specials: emptySpecials(CREW_THEME_SPECIALS_COUNT),
	},
	reference: FALLBACK_REFERENCE,
};

/**
 * `themebooks.json` as the row holds it, normalized. Returns null on any shape
 * the pickers could not render, because a half-read pack is worse than the
 * fallback: the caller substitutes FALLBACK_PACK and every screen still works.
 */
export function normalize(raw: unknown): ContentPack | null {
	if (typeof raw !== "object" || raw === null) return null;
	const { themebooks, loadout_specials, crew_theme, reference } = raw as Record<
		string,
		unknown
	>;
	if (!Array.isArray(themebooks) || themebooks.length === 0) return null;

	const normalized: Themebook[] = [];
	for (const entry of themebooks) {
		const book = normalizeThemebook(entry);
		if (!book) return null;
		normalized.push(book);
	}

	const loadoutSpecials = normalizeSpecials(
		loadout_specials,
		LOADOUT_SPECIALS_COUNT,
	);
	if (!loadoutSpecials) return null;

	const crewTheme = normalizeCrewTheme(crew_theme);
	if (!crewTheme) return null;

	return {
		themebooks: normalized,
		loadoutSpecials,
		crewTheme,
		reference: normalizeReference(reference),
	};
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

function normalizeSpecials(raw: unknown, count: number): Special[] | null {
	if (!Array.isArray(raw) || raw.length !== count) return null;
	return raw.map((special) => {
		const { name, text: rule } = (special ?? {}) as Record<string, unknown>;
		return { name: text(name), text: text(rule) };
	});
}

const pricedRow = (row: Record<string, unknown>): Priced => ({
	name: text(row.name),
	cost: text(row.cost),
	text: text(row.text),
});

const plainRow = (row: Record<string, unknown>): Special => ({
	name: text(row.name),
	text: text(row.text),
});

const rows = <T>(
	raw: unknown,
	row: (entry: Record<string, unknown>) => T,
	fallback: T[],
): T[] =>
	Array.isArray(raw)
		? raw.map((entry) => row((entry ?? {}) as Record<string, unknown>))
		: fallback;

/**
 * Never null, unlike every other section: the cheatsheet is text a player reads,
 * so a pack that predates it, or fills it in part, still loads every themebook.
 * A missing section falls back to its names with the slots left blank.
 */
function normalizeReference(raw: unknown): Reference {
	if (typeof raw !== "object" || raw === null) return FALLBACK_REFERENCE;
	const section = raw as Record<string, unknown>;

	return {
		effects: rows(section.effects, pricedRow, FALLBACK_REFERENCE.effects),
		mitigation: rows(
			section.mitigation,
			pricedRow,
			FALLBACK_REFERENCE.mitigation,
		),
		scale: rows(section.scale, plainRow, FALLBACK_REFERENCE.scale),
		powerOptions: rows(
			section.power_options,
			plainRow,
			FALLBACK_REFERENCE.powerOptions,
		),
	};
}

const isThemeType = (value: string): value is ThemeType =>
	value === "self" || value === "mythos" || value === "noise";

function normalizeThemebook(raw: unknown): Themebook | null {
	if (typeof raw !== "object" || raw === null) return null;
	const book = raw as Record<string, unknown>;

	// The pack capitalizes the type; ThemeType and the CSS `data-type` values are lowercase.
	const type = text(book.type).toLowerCase();
	if (
		typeof book.id !== "string" ||
		typeof book.name !== "string" ||
		!isThemeType(type)
	)
		return null;

	const powerQuestions = normalizeQuestions(
		POWER_LETTERS,
		book.power_tag_questions,
	);
	const weaknessQuestions = normalizeQuestions(
		WEAKNESS_LETTERS,
		book.weakness_tag_questions,
	);
	const specials = normalizeSpecials(book.specials, SPECIALS_PER_THEMEBOOK);
	if (!powerQuestions || !weaknessQuestions || !specials) return null;

	return {
		id: book.id,
		name: book.name,
		type,
		summary: text(book.summary),
		concept: text(book.concept),
		powerQuestions,
		weaknessQuestions,
		specials,
	};
}

function normalizeCrewTheme(raw: unknown): CrewThemeContent | null {
	if (typeof raw !== "object" || raw === null) return null;
	const crew = raw as Record<string, unknown>;

	const powerQuestions = normalizeQuestions(
		POWER_LETTERS,
		crew.power_tag_questions,
	);
	const weaknessQuestions = normalizeQuestions(
		WEAKNESS_LETTERS,
		crew.weakness_tag_questions,
	);
	const specials = normalizeSpecials(crew.specials, CREW_THEME_SPECIALS_COUNT);
	if (!powerQuestions || !weaknessQuestions || !specials) return null;

	return { powerQuestions, weaknessQuestions, specials };
}

function normalizeQuestions<L extends string>(
	letters: readonly L[],
	raw: unknown,
): Question<L>[] | null {
	if (typeof raw !== "object" || raw === null) return null;
	const byLetter = raw as Record<string, unknown>;
	const questions: Question<L>[] = [];
	for (const letter of letters) {
		if (typeof byLetter[letter] !== "string") return null;
		questions.push({ letter, text: byLetter[letter] });
	}
	return questions;
}

/**
 * One entry, holding the `updated_at` it was filled from. A refill replaces it,
 * so nothing accumulates. The entry keeps the row's own JSON rather than the
 * normalized pack, which leaves `normalize` the only reader of a pack shape: a
 * hand-edited entry is then rejected exactly like a bad row.
 */
export const PACK_CACHE_KEY = "otherscape:pack:themebooks";

/** Only what the cache needs, so a test can pass a plain object. */
export type PackStore = Pick<Storage, "getItem" | "setItem">;

/** The cached pack, or null when the row has been refilled since, or nothing is cached. */
export function readCachedPack(
	store: PackStore,
	updatedAt: string,
): ContentPack | null {
	try {
		const raw = store.getItem(PACK_CACHE_KEY);
		if (raw === null) return null;
		const entry: unknown = JSON.parse(raw);
		if (typeof entry !== "object" || entry === null) return null;
		const cached = entry as Record<string, unknown>;
		if (cached.updatedAt !== updatedAt) return null;
		return normalize(cached.pack);
	} catch {
		// Blocked site data, or an entry someone hand-edited. Refetching is correct.
		return null;
	}
}

/** `raw` is the row's `data` as it arrived, not the normalized pack. */
export function writeCachedPack(
	store: PackStore,
	updatedAt: string,
	raw: unknown,
): void {
	try {
		store.setItem(PACK_CACHE_KEY, JSON.stringify({ updatedAt, pack: raw }));
	} catch {
		// Private mode, or the quota is full. The pack is still in memory for this
		// page load; the next one pays for the fetch again.
	}
}
