import assert from "node:assert/strict";
import { test } from "node:test";
import { newCharacter } from "../../character/new.ts";
import type { Theme, ThemeType } from "../../character/types.ts";
import { readiness } from "../readiness.ts";

function theme(
	id: string,
	type: ThemeType,
	themebook: string,
	over: Partial<Theme> = {},
): Theme {
	return {
		id,
		type,
		themebook,
		powerTags: [
			{ id: `${id}-a`, themebook, letter: "A", text: "a title", burnt: false },
		],
		weaknessTags: [{ id: `${id}-w`, letter: "A", text: "a weakness" }],
		quote: "a line",
		specials: [],
		upgrade: 0,
		decay: 0,
		...over,
	};
}

test("a half-built character names every gap, in reading order", () => {
	const character = newCharacter();
	character.themes = [
		theme("th-1", "self", "Troubled Past", { weaknessTags: [], quote: "  " }),
		theme("th-2", "mythos", "", { powerTags: [] }),
	];
	character.loadout.wildcards = 1; // 2P against the starting 1P available

	assert.deepEqual(readiness(character), [
		"Theme 2 has no title tag.",
		"Theme 1 (Troubled Past) has no weakness tag.",
		"Theme 1 (Troubled Past) has no Identity line.",
		"No Essence is chosen.",
		"You have used 2 out of 1 loadout power available.",
	]);
});

test("the quote line is named by theme type", () => {
	const character = newCharacter();
	character.essence = "Nexus";
	character.themes = [
		theme("th-1", "mythos", "Esoterica", { quote: "" }),
		theme("th-2", "noise", "Drones", { quote: "" }),
	];
	assert.deepEqual(readiness(character), [
		"Theme 1 (Esoterica) has no Ritual line.",
		"Theme 2 (Drones) has no Itch line.",
	]);
});

test("two themes from one themebook stay apart, because O3 allows it", () => {
	const character = newCharacter();
	character.essence = "Real";
	character.themes = [
		theme("th-1", "self", "Assets", { weaknessTags: [] }),
		theme("th-2", "self", "Assets", { weaknessTags: [] }),
	];
	assert.deepEqual(readiness(character), [
		"Theme 1 (Assets) has no weakness tag.",
		"Theme 2 (Assets) has no weakness tag.",
	]);
});

test("a fifth theme is reported", () => {
	const character = newCharacter();
	character.essence = "Real";
	character.themes = [1, 2, 3, 4, 5].map((n) =>
		theme(`th-${n}`, "self", "Assets"),
	);
	assert.deepEqual(readiness(character), [
		"The character has 5 themes, more than the 4 it starts with.",
	]);
});

test("a complete character reports nothing", () => {
	const character = newCharacter();
	character.essence = "Spiritualist";
	character.themes = [
		theme("th-1", "self", "Troubled Past"),
		theme("th-2", "self", "Assets"),
		theme("th-3", "mythos", "Esoterica"),
		theme("th-4", "mythos", "Artifact"),
	];
	// A set spent right up to the starting budget, never past it.
	character.loadout.sets = [
		{
			id: "ls-1",
			title: "burner deck",
			titleLoaded: true,
			titleBurnt: false,
			features: [],
			weaknesses: [],
		},
	];
	assert.deepEqual(readiness(character), []);
});
