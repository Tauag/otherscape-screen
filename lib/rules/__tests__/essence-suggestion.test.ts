import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "../../character/__tests__/sample.ts";
import type { ThemeType } from "../../character/types.ts";
import { ESSENCES, essenceSuggestion } from "../essence-suggestion.ts";

function themes(...types: ThemeType[]) {
	return types.map((type) => ({ type }));
}

test("a Mythos-only mix suggests the pair, and neither one alone", () => {
	const suggestion = essenceSuggestion(themes("mythos", "mythos"), "");
	assert.deepEqual(suggestion.candidates, ["Avatar", "Conduit"]);
	assert.equal(suggestion.state, "unchosen");
	assert.equal(suggestion.chosen, "");
	assert.equal(suggestion.warning, null);
});

// T31's Done-when.
test("changing a theme type re-suggests and leaves the choice alone", () => {
	const mix = themes("mythos", "mythos");
	const before = essenceSuggestion(mix, "Avatar");
	assert.equal(before.state, "suggested");

	mix[1].type = "self";
	const after = essenceSuggestion(mix, "Avatar");
	assert.deepEqual(after.candidates, ["Spiritualist"]);
	assert.equal(after.chosen, "Avatar");
});

test("a choice the new mix does not suggest is kept, with a sentence about it", () => {
	const suggestion = essenceSuggestion(themes("mythos"), "Real");
	assert.equal(suggestion.state, "mismatch");
	assert.equal(suggestion.chosen, "Real");
	assert.equal(
		suggestion.warning,
		"The theme mix now suggests Avatar or Conduit. Real stays chosen until you change it.",
	);
});

test("no themes suggests nothing and argues with nothing", () => {
	assert.deepEqual(essenceSuggestion([], ""), {
		candidates: [],
		chosen: "",
		state: "unchosen",
		warning: null,
	});

	const kept = essenceSuggestion([], "Nexus");
	assert.equal(kept.state, "override");
	assert.equal(kept.chosen, "Nexus");
	assert.equal(kept.warning, null);
});

test("the sample character's mix suggests the Essence it carries", () => {
	const suggestion = essenceSuggestion(sample.themes, sample.essence);
	assert.deepEqual(suggestion.candidates, ["Nexus"]);
	assert.equal(suggestion.state, "suggested");
});

test("the override list holds all eight Essences once", () => {
	assert.equal(new Set(ESSENCES).size, 8);
});
