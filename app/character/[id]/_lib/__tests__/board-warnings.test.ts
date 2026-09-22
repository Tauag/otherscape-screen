import assert from "node:assert/strict";
import { test } from "node:test";
import { newCharacter } from "@/lib/character/new";
import { DECAY_TRACK_LENGTH } from "@/lib/rules/constants";
import { boardWarnings } from "../board-warnings.ts";
import { reduce } from "../reducer.ts";

test("a themeless character gets the empty-state sentence", () => {
	const warnings = boardWarnings(newCharacter());
	assert.ok(warnings.some((one) => one.includes("no themes yet")));
});

test("a full Decay track names the theme it belongs to", () => {
	let character = reduce(newCharacter(), { type: "addTheme", id: "t1" });
	for (let i = 0; i < DECAY_TRACK_LENGTH; i++) {
		character = reduce(character, {
			type: "markTrack",
			themeId: "t1",
			track: "decay",
		});
	}

	const warnings = boardWarnings(character);
	assert.ok(warnings.some((one) => one.includes("Decay track is full")));
});
