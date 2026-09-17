import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
	LOADOUT_SPECIALS_COUNT,
	POWER_LETTERS,
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
