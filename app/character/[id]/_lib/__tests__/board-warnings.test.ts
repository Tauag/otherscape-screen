import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "@/lib/character/__tests__/sample";
import { newCharacter } from "@/lib/character/new";
import type { Character } from "@/lib/character/types";
import { DECAY_TRACK_LENGTH } from "@/lib/rules/constants";
import { boardWarnings } from "../board-warnings.ts";
import { reduce } from "../reducer.ts";

/** A character with `count` themes, every one of them Mythos. */
function mythosThemes(count: number): Character {
	let character = newCharacter();
	for (let i = 0; i < count; i++) {
		character = reduce(character, { type: "addTheme", id: `t${i}` });
		character = reduce(character, {
			type: "setThemeType",
			themeId: `t${i}`,
			themeType: "mythos",
		});
	}
	return character;
}

function decayed(character: Character, themeId: string): Character {
	let next = character;
	for (let i = 0; i < DECAY_TRACK_LENGTH; i++) {
		next = reduce(next, { type: "markTrack", themeId, track: "decay" });
	}
	return next;
}

test("a themeless character gets the empty-state sentence, and nothing else", () => {
	assert.deepEqual(boardWarnings(newCharacter()), [
		"This character has no themes yet.",
	]);
});

test("a full Decay track names the theme by its title tag", () => {
	let character = reduce(newCharacter(), { type: "addTheme", id: "t1" });
	character = reduce(character, {
		type: "addPowerTag",
		themeId: "t1",
		id: "pt-1",
		letter: "A",
	});
	character = reduce(character, {
		type: "editPowerTag",
		themeId: "t1",
		tagId: "pt-1",
		edit: { text: "the bone lantern" },
	});

	// The tag's own text, uncapitalized: a tag is written lowercase on the sheet.
	assert.deepEqual(boardWarnings(decayed(character, "t1")), [
		"the bone lantern's Decay track is full.",
	]);
});

test("an untitled theme's full Decay track still names something", () => {
	const character = decayed(
		reduce(newCharacter(), { type: "addTheme", id: "t1" }),
		"t1",
	);
	assert.ok(
		boardWarnings(character).includes("A theme's Decay track is full."),
	);
});

test("the crew's own full Decay track is reported separately", () => {
	let character = reduce(newCharacter(), { type: "addTheme", id: "t1" });
	for (let i = 0; i < DECAY_TRACK_LENGTH; i++) {
		character = reduce(character, { type: "markCrewTrack", track: "decay" });
	}
	assert.ok(
		boardWarnings(character).includes("The crew's Decay track is full."),
	);
});

// The only place this sentence exists: a Mythos-only mix is the one tie the app
// cannot resolve on its own, so the board has to ask for the choice.
test("a Mythos-only mix asks the player to break the tie", () => {
	assert.ok(
		boardWarnings(mythosThemes(4)).includes(
			"Your themes tie between Avatar and Conduit. Pick one from the menu.",
		),
	);
});

test("an untied mix, and a mix the player already chose from, never ask", () => {
	let character = newCharacter();
	for (let i = 0; i < 4; i++) {
		character = reduce(character, { type: "addTheme", id: `t${i}` });
	}
	// All Self: one candidate, auto-assigned, so no tie to break.
	assert.deepEqual(boardWarnings(character), []);

	const chosen = reduce(mythosThemes(4), {
		type: "setEssence",
		essence: "Avatar",
	});
	assert.deepEqual(boardWarnings(chosen), []);
});

test("an over-budget loadout is reported in the same strip", () => {
	let character = reduce(newCharacter(), { type: "addTheme", id: "t1" });
	character = reduce(character, { type: "incrementWildcards" });
	assert.ok(
		boardWarnings(character).includes(
			"You have used 2 out of 1 loadout power available.",
		),
	);
});

test("every sentence appears at most once, in reading order", () => {
	// The sample carries 4 themes, a chosen Essence, a loadout at budget, and
	// th-lantern's Decay track already full.
	assert.deepEqual(boardWarnings(sample), [
		"the bone lantern's Decay track is full.",
	]);

	// A fifth theme, itself one Decay box short of full.
	const fifth = { ...sample.themes[0], id: "th-extra" };
	const five: Character = { ...sample, themes: [...sample.themes, fifth] };
	assert.deepEqual(boardWarnings(five), [
		"The character has 5 themes, more than the 4 it starts with.",
		"the bone lantern's Decay track is full.",
	]);

	// The count sentence still comes first once that fifth track fills, and the
	// two Decay lines follow in theme order.
	const bothFull: Character = {
		...five,
		themes: five.themes.map((theme) =>
			theme.id === "th-extra" ? { ...theme, decay: DECAY_TRACK_LENGTH } : theme,
		),
	};
	assert.deepEqual(boardWarnings(bothFull), [
		"The character has 5 themes, more than the 4 it starts with.",
		"the bone lantern's Decay track is full.",
		"ex-corpsec detective's Decay track is full.",
	]);
});
