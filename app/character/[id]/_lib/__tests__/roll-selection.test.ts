import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "@/lib/character/__tests__/sample";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { power } from "@/lib/rules/power";
import {
	boardGroups,
	burningTagId,
	burnToggleAction,
	NO_PICK,
	rollGroups,
	toRollSelection,
} from "../roll-selection.ts";

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

test("a burnt story tag carries its burn value into the selection", () => {
	// sg-1 is burnt in the sample, at the default value.
	const selection = toRollSelection(sample, pick({ ids: ["sg-1"] }));
	assert.equal(selection.tags[0].burnValue, DEFAULT_BURN_VALUE);
});

test("a negative story tag never carries a burn value", () => {
	const selection = toRollSelection(sample, pick({ ids: ["sg-2"] }));
	assert.equal(selection.tags[0].burnValue, null);
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

test("burnToggleAction finds a theme power tag by id", () => {
	assert.deepEqual(burnToggleAction(sample, "pt-1", true), {
		type: "burnTag",
		themeId: "th-past",
		tagId: "pt-1",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.deepEqual(burnToggleAction(sample, "pt-1", false), {
		type: "unburnTag",
		themeId: "th-past",
		tagId: "pt-1",
	});
});

test("burnToggleAction finds a crew power tag, a story tag, and a loadout feature", () => {
	assert.deepEqual(burnToggleAction(sample, "cpt-1", true), {
		type: "burnCrewTag",
		tagId: "cpt-1",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.deepEqual(burnToggleAction(sample, "sg-2", true), {
		type: "burnStoryTag",
		id: "sg-2",
		burnValue: DEFAULT_BURN_VALUE,
	});
	assert.deepEqual(burnToggleAction(sample, "lf-1", true), {
		type: "toggleLoadoutFeatureBurnt",
		setId: "ls-1",
		featureId: "lf-1",
	});
});

test("burnToggleAction reads null for an id off the sheet", () => {
	assert.equal(burnToggleAction(sample, "not-a-tag", true), null);
});

test("burningTagId reads the one selected tag that is already burnt", () => {
	// pt-3 is burnt in the sample; pt-1 is not.
	assert.equal(burningTagId(sample, NO_PICK), null);
	assert.equal(burningTagId(sample, { ...NO_PICK, ids: ["pt-1"] }), null);
	assert.equal(
		burningTagId(sample, { ...NO_PICK, ids: ["pt-1", "pt-3"] }),
		"pt-3",
	);
});

test("the crew group carries the crew's power tags and its relationship tags", () => {
	const crew = rollGroups(sample).find((group) => group.id === "crew");
	const ids = crew?.tags.map((tag) => tag.id);
	// cpt-1, cpt-2 are the crew theme's power tags; cr-1, cr-2 are relationships.
	assert.deepEqual(ids, ["cpt-1", "cpt-2", "cr-1", "cr-2", "cwt-1"]);
});

test("a crew power tag and a crew relationship are always crispy: positive, but never burnable", () => {
	const crew = rollGroups(sample).find((group) => group.id === "crew");
	const cpt1 = crew?.tags.find((tag) => tag.id === "cpt-1");
	const cr1 = crew?.tags.find((tag) => tag.id === "cr-1");
	assert.deepEqual(
		[cpt1?.valence, cpt1?.canBurn, cpt1?.crispy],
		["positive", false, true],
	);
	assert.deepEqual(
		[cr1?.valence, cr1?.canBurn, cr1?.crispy],
		["positive", false, true],
	);
});

test("a crew relationship's chip reads as the member's name and their tag", () => {
	const crew = rollGroups(sample).find((group) => group.id === "crew");
	const cr1 = crew?.tags.find((tag) => tag.id === "cr-1");
	assert.equal(cr1?.text, "Tamsin — she talked me off a ledge once");
});

test("an unburnt crew relationship contributes the plain +1, and a burnt one is already spent", () => {
	// cr-1 is unburnt in the sample; cr-2 is burnt.
	const selection = toRollSelection(sample, pick({ ids: ["cr-1"] }));
	assert.equal(selection.tags[0].burnValue, null);
	assert.equal(power(selection).total, 1);

	const crew = rollGroups(sample).find((group) => group.id === "crew");
	const cr2 = crew?.tags.find((tag) => tag.id === "cr-2");
	assert.notEqual(cr2?.burnValue, null);
});

test("boardGroups keeps a nascent theme with zero tags, which rollGroups drops", () => {
	const nascent = {
		id: "th-nascent",
		type: "noise" as const,
		themebook: "",
		powerTags: [],
		weaknessTags: [],
		quote: "",
		specials: [],
		upgrade: 0 as const,
		decay: 0 as const,
	};
	const character = { ...sample, themes: [...sample.themes, nascent] };

	assert.equal(
		rollGroups(character).some((group) => group.id === "th-nascent"),
		false,
	);

	const board = boardGroups(character);
	const panel = board.find((group) => group.id === "th-nascent");
	assert.deepEqual(panel, {
		id: "th-nascent",
		hue: "noise",
		label: "noise · No themebook",
		tags: [],
	});

	// One panel per theme, in order, plus loadout and crew last.
	assert.deepEqual(
		board.map((group) => group.id),
		[...character.themes.map((theme) => theme.id), "loadout", "crew"],
	);
});
