import assert from "node:assert/strict";
import { test } from "node:test";
import type { Loadout, LoadoutSet } from "../../character/types.ts";
import { loadoutSpend } from "../loadout.ts";

function set(overrides: Partial<LoadoutSet> = {}): LoadoutSet {
	return {
		id: "ls-1",
		title: "kit",
		titleLoaded: false,
		titleBurnt: false,
		features: [],
		weaknesses: [],
		...overrides,
	};
}

function loadout(
	availablePower: number,
	overrides: Partial<Loadout> = {},
): Loadout {
	return {
		sets: [],
		wildcards: 0,
		specials: [],
		availablePower,
		upgrade: 0,
		...overrides,
	};
}

test("an empty loadout spends nothing", () => {
	assert.deepEqual(loadoutSpend(loadout(1)), {
		spent: 0,
		available: 1,
		over: 0,
		warning: null,
	});
});

test("an unloaded title and an unloaded feature cost nothing", () => {
	const l = loadout(1, {
		sets: [
			set({
				titleLoaded: false,
				features: [{ id: "lf-1", text: "a", loaded: false, burnt: false }],
			}),
		],
	});
	assert.equal(loadoutSpend(l).spent, 0);
});

test("a loaded title costs 1, and a loaded feature costs 1 more", () => {
	const l = loadout(3, {
		sets: [
			set({
				titleLoaded: true,
				features: [
					{ id: "lf-1", text: "a", loaded: true, burnt: false },
					{ id: "lf-2", text: "b", loaded: false, burnt: false },
				],
			}),
		],
	});
	assert.deepEqual(loadoutSpend(l), {
		spent: 2,
		available: 3,
		over: 0,
		warning: null,
	});
});

test("a weakness never costs anything, loaded title or not", () => {
	const l = loadout(0, {
		sets: [
			set({
				titleLoaded: true,
				weaknesses: [{ id: "lw-1", text: "flinches at chrome" }],
			}),
		],
	});
	assert.equal(loadoutSpend(l).spent, 1); // the loaded title, not the weakness
});

test("each wildcard costs 2", () => {
	assert.equal(loadoutSpend(loadout(4, { wildcards: 2 })).spent, 4);
});

test("an over-budget loadout reports the gap as a sentence", () => {
	const l = loadout(1, { wildcards: 2 });
	assert.deepEqual(loadoutSpend(l), {
		spent: 4,
		available: 1,
		over: 3,
		warning: "You have 4 out of 1 loadout power available.",
	});
});
