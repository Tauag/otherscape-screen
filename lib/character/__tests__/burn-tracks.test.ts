import assert from "node:assert/strict";
import { test } from "node:test";
import { burnValueOf } from "../../rules/power.ts";
import { addPowerTag, burnTag, markTrack, unburnTag } from "../theme.ts";
import type { PowerTag, Theme } from "../types.ts";
import { sample } from "./sample.ts";

// Power tags pt-1, pt-2, and pt-3, where pt-3 is already burnt. Upgrade 2, Decay 1.
const past = sample.themes[0];

function tag(theme: Theme, id: string): PowerTag {
	const found = theme.powerTags.find((one) => one.id === id);
	assert.ok(found, `the sample has no power tag ${id}`);
	return found;
}

test("the value the dialog sets is the value power reads", () => {
	assert.equal(burnValueOf(tag(burnTag(past, "pt-1", 5), "pt-1")), 5);
	assert.equal(burnValueOf(tag(burnTag(past, "pt-1", 4), "pt-1")), 4);
});

test("an untouched 3 stays absent and still reads as 3", () => {
	const burned = tag(burnTag(past, "pt-1", 3), "pt-1");

	assert.equal(burned.burnt, true);
	assert.equal("burnValue" in burned, false);
	assert.equal(burnValueOf(burned), 3);
});

test("a burn at 3 after a burn at 5 does not keep the 5", () => {
	const twice = burnTag(burnTag(past, "pt-1", 5), "pt-1", 3);
	assert.equal(burnValueOf(tag(twice, "pt-1")), 3);
});

test("un-burning restores the unburnt reading and drops the value", () => {
	const back = tag(unburnTag(burnTag(past, "pt-1", 5), "pt-1"), "pt-1");

	assert.equal(back.burnt, false);
	assert.equal("burnValue" in back, false);
	assert.equal(burnValueOf(back), null);
	assert.equal(burnValueOf(tag(unburnTag(past, "pt-3"), "pt-3")), null);
});

test("a burn touches one tag and nothing else on the theme", () => {
	const burned = burnTag(past, "pt-1", 4);

	assert.deepEqual(burned.powerTags.slice(1), past.powerTags.slice(1));
	assert.deepEqual(burned.weaknessTags, past.weaknessTags);
});

test("marking the third Upgrade box clears the track", () => {
	assert.equal(past.upgrade, 2);
	assert.equal(markTrack(past, "upgrade").upgrade, 0);
});

test("the Upgrade outcome applies on the cleared track: a new power tag", () => {
	const cleared = markTrack(past, "upgrade");
	const taken = addPowerTag(cleared, "pt-up", "C");

	assert.equal(taken.upgrade, 0);
	assert.equal(taken.powerTags.length, past.powerTags.length + 1);
	assert.equal(taken.powerTags.at(-1)?.id, "pt-up");
	assert.equal(
		new Set(taken.powerTags.map((one) => one.id)).size,
		taken.powerTags.length,
	);
});

test("a full Decay track wraps back to empty on the next click", () => {
	const full: Theme = { ...past, decay: 3 };

	assert.equal(markTrack(full, "decay").decay, 0);
});

test("the Decay track marks one box at a time, and touches nothing else", () => {
	const marked = markTrack({ ...past, decay: 1 }, "decay");

	assert.equal(marked.decay, 2);
	assert.equal(marked.upgrade, past.upgrade);
	assert.deepEqual(marked.powerTags, past.powerTags);
	assert.deepEqual(marked.weaknessTags, past.weaknessTags);
});

test("marking a track leaves the other one alone", () => {
	const marked = markTrack({ ...past, upgrade: 0 }, "upgrade");

	assert.equal(marked.upgrade, 1);
	assert.equal(marked.decay, past.decay);
});
