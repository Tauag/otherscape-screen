import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
	CREW_THEME_SPECIALS_COUNT,
	EFFECT_NAMES,
	EVOLUTION_MOMENT_NAMES,
	LOADOUT_SPECIALS_COUNT,
	POWER_LETTERS,
	POWER_OPTION_NAMES,
	VETERAN_SPECIALS_COUNT,
	WEAKNESS_LETTERS,
} from "../fallback.ts";
import {
	type ContentPack,
	FALLBACK_PACK,
	findThemebook,
	normalize,
	PACK_CACHE_KEY,
	type PackStore,
	questionLabel,
	readCachedPack,
	themebooksOfType,
	writeCachedPack,
} from "../pack.ts";

function store(): PackStore & { entry: () => string | null } {
	let value: string | null = null;
	return {
		getItem: (key) => (key === PACK_CACHE_KEY ? value : null),
		setItem: (key, next) => {
			if (key === PACK_CACHE_KEY) value = next;
		},
		entry: () => value,
	};
}

/** A one-themebook pack in the row's own JSON shape. Fresh each call, to mutate. */
const rawPack = () => ({
	themebooks: [
		{
			id: "x",
			name: "X",
			type: "Self",
			power_tag_questions: Object.fromEntries(
				POWER_LETTERS.map((letter) => [letter, "q"]),
			),
			weakness_tag_questions: Object.fromEntries(
				WEAKNESS_LETTERS.map((letter) => [letter, "q"]),
			),
			specials: Array.from({ length: 5 }, () => ({ name: "n", text: "t" })),
		},
	],
	loadout_specials: Array.from({ length: LOADOUT_SPECIALS_COUNT }, () => ({
		name: "n",
		text: "t",
	})),
	crew_theme: {
		power_tag_questions: Object.fromEntries(
			POWER_LETTERS.map((letter) => [letter, "q"]),
		),
		weakness_tag_questions: Object.fromEntries(
			WEAKNESS_LETTERS.map((letter) => [letter, "q"]),
		),
		specials: Array.from({ length: CREW_THEME_SPECIALS_COUNT }, () => ({
			name: "n",
			text: "t",
		})),
	},
});

/** Every themebook carries the full set of slots, whatever filled them. */
function assertShape(pack: ContentPack) {
	for (const book of pack.themebooks) {
		assert.ok(
			["self", "mythos", "noise"].includes(book.type),
			`${book.id} has type ${book.type}`,
		);
		assert.deepEqual(
			book.powerQuestions.map((q) => q.letter),
			[...POWER_LETTERS],
		);
		assert.deepEqual(
			book.weaknessQuestions.map((q) => q.letter),
			[...WEAKNESS_LETTERS],
		);
		assert.equal(book.specials.length, 5);
	}
	assert.equal(pack.loadoutSpecials.length, LOADOUT_SPECIALS_COUNT);
	assert.deepEqual(
		pack.crewTheme.powerQuestions.map((q) => q.letter),
		[...POWER_LETTERS],
	);
	assert.deepEqual(
		pack.crewTheme.weaknessQuestions.map((q) => q.letter),
		[...WEAKNESS_LETTERS],
	);
	assert.equal(pack.crewTheme.specials.length, CREW_THEME_SPECIALS_COUNT);
}

test("the fallback holds the 14 themebooks, with every text slot empty", () => {
	assert.equal(FALLBACK_PACK.themebooks.length, 14);
	assertShape(FALLBACK_PACK);

	for (const book of FALLBACK_PACK.themebooks) {
		assert.ok(book.name.length > 0);
		assert.equal(book.summary, "");
		assert.equal(book.concept, "");
		for (const question of [
			...book.powerQuestions,
			...book.weaknessQuestions,
		]) {
			assert.equal(question.text, "");
		}
		assert.deepEqual(
			book.specials,
			Array.from({ length: 5 }, () => ({ name: "", text: "" })),
		);
	}
	assert.deepEqual(
		FALLBACK_PACK.loadoutSpecials,
		Array.from({ length: LOADOUT_SPECIALS_COUNT }, () => ({
			name: "",
			text: "",
		})),
	);
	for (const question of [
		...FALLBACK_PACK.crewTheme.powerQuestions,
		...FALLBACK_PACK.crewTheme.weaknessQuestions,
	]) {
		assert.equal(question.text, "");
	}
	assert.deepEqual(
		FALLBACK_PACK.crewTheme.specials,
		Array.from({ length: CREW_THEME_SPECIALS_COUNT }, () => ({
			name: "",
			text: "",
		})),
	);
});

test("the fallback reference holds the names it knows, and nothing it does not", () => {
	const { reference } = FALLBACK_PACK;

	assert.deepEqual(
		reference.effects,
		EFFECT_NAMES.map((name) => ({ name, cost: "", text: "" })),
	);
	assert.deepEqual(
		reference.powerOptions,
		POWER_OPTION_NAMES.map((name) => ({ name, text: "" })),
	);

	// The mitigation rows, the Scale steps, and the Going Out In a Blaze rules
	// are in the printed cheatsheet alone, so the fallback does not even know
	// how many there are.
	assert.deepEqual(reference.mitigation, []);
	assert.deepEqual(reference.scale, []);
	assert.deepEqual(reference.blaze, []);
});

test("a pack with no reference section loads, and keeps the fallback names", () => {
	const pack = normalize(rawPack());
	assert.deepEqual(pack?.reference, FALLBACK_PACK.reference);

	const partial = rawPack() as ReturnType<typeof rawPack> & {
		reference: unknown;
	};
	partial.reference = {
		effects: [{ name: "Attack", cost: "1 Power", text: "Inflict a status." }],
		scale: [{ name: "Same scale", text: "No change." }],
	};

	const filled = normalize(partial);
	assert.deepEqual(filled?.reference.effects, [
		{ name: "Attack", cost: "1 Power", text: "Inflict a status." },
	]);
	assert.deepEqual(filled?.reference.scale, [
		{ name: "Same scale", text: "No change." },
	]);
	// A section the pack leaves out keeps its names and its blank slots.
	assert.deepEqual(
		filled?.reference.powerOptions,
		FALLBACK_PACK.reference.powerOptions,
	);

	// A row missing a field reads as a blank slot, never as a dropped pack.
	const sparse = rawPack() as ReturnType<typeof rawPack> & {
		reference: unknown;
	};
	sparse.reference = { effects: [{ name: "Attack" }, null] };
	assert.deepEqual(normalize(sparse)?.reference.effects, [
		{ name: "Attack", cost: "", text: "" },
		{ name: "", cost: "", text: "" },
	]);
});

test("the fallback evolution section holds the Moment names it knows, and nothing it does not", () => {
	const { evolution } = FALLBACK_PACK;

	assert.deepEqual(
		evolution.moments,
		EVOLUTION_MOMENT_NAMES.map((name) => ({ name, text: "" })),
	);
	assert.deepEqual(
		evolution.veteranSpecials,
		Array.from({ length: VETERAN_SPECIALS_COUNT }, () => ({
			name: "",
			text: "",
		})),
	);
});

test("a pack with no evolution section loads, and keeps the fallback Moment names", () => {
	const pack = normalize(rawPack());
	assert.deepEqual(pack?.evolution, FALLBACK_PACK.evolution);

	const partial = rawPack() as ReturnType<typeof rawPack> & {
		evolution: unknown;
	};
	partial.evolution = {
		moments: [{ name: "Create a new type of Essence", text: "As written." }],
	};

	const filled = normalize(partial);
	assert.deepEqual(filled?.evolution.moments, [
		{ name: "Create a new type of Essence", text: "As written." },
	]);
	// A section the pack leaves out keeps its fallback slots.
	assert.deepEqual(
		filled?.evolution.veteranSpecials,
		FALLBACK_PACK.evolution.veteranSpecials,
	);
});

test("the themebooks split 6 self, 4 mythos, 4 noise", () => {
	assert.equal(themebooksOfType(FALLBACK_PACK, "self").length, 6);
	assert.equal(themebooksOfType(FALLBACK_PACK, "mythos").length, 4);
	assert.equal(themebooksOfType(FALLBACK_PACK, "noise").length, 4);
});

test("a themebook is found by id or by the free-text name a theme stores", () => {
	assert.equal(
		findThemebook(FALLBACK_PACK, "troubled-past")?.name,
		"Troubled Past",
	);
	assert.equal(
		findThemebook(FALLBACK_PACK, " troubled past ")?.id,
		"troubled-past",
	);
	assert.equal(findThemebook(FALLBACK_PACK, "Bees"), null);
});

test("an unanswered slot is labelled by kind and letter", () => {
	assert.equal(questionLabel("power", "B"), "power tag question B");
	assert.equal(questionLabel("weakness", "A"), "weakness tag question A");
});

test("the real content pack normalizes into the same shape, with text filled", (t) => {
	// The pack is publisher text and stays out of git (see .gitignore), so it is
	// absent on a fresh clone. Where it is present, an edit that breaks the shape
	// fails here.
	const path = join(import.meta.dirname, "../../../content/themebooks.json");
	let raw: string;
	try {
		raw = readFileSync(path, "utf8");
	} catch {
		t.skip(`no content pack at ${path}`);
		return;
	}

	const pack = normalize(JSON.parse(raw));
	assert.ok(pack, "the real pack normalizes");
	assert.equal(pack.themebooks.length, 14);
	assertShape(pack);

	assert.deepEqual(
		pack.themebooks.map((book) => book.id),
		FALLBACK_PACK.themebooks.map((book) => book.id),
	);

	for (const book of pack.themebooks) {
		assert.ok(book.concept.length > 0, `${book.id} has a concept`);
		for (const question of [
			...book.powerQuestions,
			...book.weaknessQuestions,
		]) {
			assert.ok(
				question.text.length > 0,
				`${book.id} ${question.letter} has text`,
			);
		}
		for (const special of book.specials) assert.ok(special.name.length > 0);
	}
	for (const special of pack.loadoutSpecials)
		assert.ok(special.name.length > 0);

	for (const question of [
		...pack.crewTheme.powerQuestions,
		...pack.crewTheme.weaknessQuestions,
	]) {
		assert.ok(question.text.length > 0, `crew theme ${question.letter}`);
	}
	for (const special of pack.crewTheme.specials)
		assert.ok(special.name.length > 0);
});

test("a pack missing a question letter or a special is rejected whole", () => {
	assert.equal(normalize(rawPack())?.themebooks[0].type, "self");

	const missingLetter = rawPack();
	delete missingLetter.themebooks[0].power_tag_questions.J;
	assert.equal(normalize(missingLetter), null);

	const fourSpecials = rawPack();
	fourSpecials.themebooks[0].specials.pop();
	assert.equal(normalize(fourSpecials), null);

	const unknownType = rawPack();
	unknownType.themebooks[0].type = "Crew";
	assert.equal(normalize(unknownType), null);

	const shortLoadoutSpecials = rawPack();
	shortLoadoutSpecials.loadout_specials.pop();
	assert.equal(normalize(shortLoadoutSpecials), null);

	const missingLoadoutSpecials = rawPack() as Partial<
		ReturnType<typeof rawPack>
	>;
	delete missingLoadoutSpecials.loadout_specials;
	assert.equal(normalize(missingLoadoutSpecials), null);

	const shortCrewSpecials = rawPack();
	shortCrewSpecials.crew_theme.specials.pop();
	assert.equal(normalize(shortCrewSpecials), null);

	const missingCrewQuestion = rawPack();
	delete (
		missingCrewQuestion.crew_theme.power_tag_questions as Record<
			string,
			unknown
		>
	).J;
	assert.equal(normalize(missingCrewQuestion), null);

	const missingCrewTheme = rawPack() as Partial<ReturnType<typeof rawPack>>;
	delete missingCrewTheme.crew_theme;
	assert.equal(normalize(missingCrewTheme), null);

	for (const bad of [null, 7, "{}", {}, { themebooks: [] }])
		assert.equal(normalize(bad), null);
});

test("the cache is reused at the same updated_at and dropped when the row is refilled", () => {
	const cache = store();
	const expected = normalize(rawPack());
	assert.equal(readCachedPack(cache, "2026-01-01T00:00:00Z"), null);

	writeCachedPack(cache, "2026-01-01T00:00:00Z", rawPack());
	assert.deepEqual(readCachedPack(cache, "2026-01-01T00:00:00Z"), expected);
	assert.equal(readCachedPack(cache, "2026-02-02T00:00:00Z"), null);

	// A refill replaces the one entry rather than adding another.
	writeCachedPack(cache, "2026-02-02T00:00:00Z", rawPack());
	assert.deepEqual(readCachedPack(cache, "2026-02-02T00:00:00Z"), expected);
	assert.equal(readCachedPack(cache, "2026-01-01T00:00:00Z"), null);
});

test("offline, with no updated_at to compare, any cached pack is reused", () => {
	const cache = store();
	assert.equal(readCachedPack(cache), null);

	writeCachedPack(cache, "2026-01-01T00:00:00Z", rawPack());
	assert.deepEqual(readCachedPack(cache), normalize(rawPack()));
});

test("a storage that throws, or holds nonsense, reads as no cache", () => {
	const throwing: PackStore = {
		getItem: () => {
			throw new Error("site data blocked");
		},
		setItem: () => {
			throw new Error("site data blocked");
		},
	};
	assert.equal(readCachedPack(throwing, "2026-01-01T00:00:00Z"), null);
	writeCachedPack(throwing, "2026-01-01T00:00:00Z", rawPack());

	const cache = store();
	cache.setItem(PACK_CACHE_KEY, "not json");
	assert.equal(readCachedPack(cache, "2026-01-01T00:00:00Z"), null);

	cache.setItem(
		PACK_CACHE_KEY,
		JSON.stringify({ updatedAt: "2026-01-01T00:00:00Z", pack: {} }),
	);
	assert.equal(readCachedPack(cache, "2026-01-01T00:00:00Z"), null);
});
