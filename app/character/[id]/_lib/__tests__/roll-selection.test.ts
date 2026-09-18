import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "@/lib/character/__tests__/sample";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { power } from "@/lib/rules/power";
import { NO_PICK, toRollSelection } from "../roll-selection.ts";

const pick = (over: Partial<typeof NO_PICK>) => ({ ...NO_PICK, ...over });

test("a burnt tag carries the default burn value when nothing overrides it", () => {
	const selection = toRollSelection(sample, pick({ ids: ["pt-3"] }));
	assert.equal(selection.tags[0].burnValue, DEFAULT_BURN_VALUE);
});

test("a burnt tag carries this roll's override instead of the default", () => {
	const selection = toRollSelection(
		sample,
		pick({ ids: ["pt-3"], burnValues: { "pt-3": 5 } }),
	);
	assert.equal(selection.tags[0].burnValue, 5);
	// The override is the pick's alone: the document still reads as it did.
	assert.equal(sample.themes[0].powerTags[2].burnValue, undefined);
});

test("an unburnt tag carries no burn value", () => {
	const selection = toRollSelection(sample, pick({ ids: ["pt-2"] }));
	assert.equal(selection.tags[0].burnValue, null);
});

test("a weakness tag is negative", () => {
	const selection = toRollSelection(sample, pick({ ids: ["wt-1"] }));
	assert.equal(selection.tags[0].valence, "negative");
	assert.equal(power(selection).total, -1);
});

test("a status carries its highest marked tier, not its lowest", () => {
	// st-1 is marked at tiers 2 and 4, so it reads as exhausted-4.
	const selection = toRollSelection(sample, pick({ ids: ["st-1"] }));
	assert.equal(selection.statuses[0].tier, 4);
});

test("only the highest tier each side counts, and the outranked one stays visible", () => {
	// Both are negative: st-1 reads tier 4, st-3 tier 6, so st-1 is outranked.
	const selection = toRollSelection(sample, pick({ ids: ["st-1", "st-3"] }));
	const lines = power(selection).lines;
	assert.deepEqual(
		lines.map((line) => line.counted),
		[false, true],
	);
	assert.equal(power(selection).total, -6);
});

test("a scratched story tag cannot enter the selection, even with its id picked", () => {
	const selection = toRollSelection(sample, pick({ ids: ["sg-1", "sg-2"] }));
	assert.deepEqual(
		selection.tags.map((tag) => tag.label),
		["rain-slicked rooftops"],
	);
});

test("a status marked out cannot enter the selection", () => {
	const out = {
		...sample,
		statuses: sample.statuses.map((status) =>
			status.id === "st-2" ? { ...status, out: true } : status,
		),
	};
	assert.equal(
		toRollSelection(out, pick({ ids: ["st-2"] })).statuses.length,
		0,
	);
});

test("rolling with a theme type carries the count of themes of that type", () => {
	// The sample holds one self, one mythos, and two noise themes.
	const selection = toRollSelection(sample, pick({ rollWith: "noise" }));
	assert.deepEqual(selection.rollWith, { type: "noise", themeCount: 2 });
});

test("rolling with a domain stops a positive tag counting, and keeps the weakness", () => {
	const selection = toRollSelection(
		sample,
		pick({ ids: ["pt-2", "wt-1"], rollWith: "noise" }),
	);
	// 2 for the two noise themes, minus 1 for the weakness, and the power tag
	// contributes nothing (O1).
	assert.equal(power(selection).total, 1);
});

test("the modifier rides through untouched", () => {
	assert.equal(toRollSelection(sample, pick({ modifier: -2 })).modifier, -2);
});

test("an empty pick totals zero", () => {
	assert.equal(power(toRollSelection(sample, NO_PICK)).total, 0);
});
