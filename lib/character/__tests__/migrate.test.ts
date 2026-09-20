import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMA_VERSION, migrate } from "../migrate.ts";
import { sample } from "./sample.ts";

test("a current-version document passes through unchanged", () => {
	const stored: unknown = JSON.parse(JSON.stringify(sample));
	assert.deepEqual(migrate(stored), sample);
});

test("a non-object is rejected", () => {
	for (const bad of [null, undefined, 7, "{}", [sample]]) {
		assert.throws(() => migrate(bad), /not an object/);
	}
});

test("a missing or non-numeric schema_version is rejected", () => {
	const withoutVersion: Record<string, unknown> = { ...sample };
	delete withoutVersion.schema_version;
	assert.throws(() => migrate(withoutVersion), /schema_version/);
	assert.throws(
		() => migrate({ ...sample, schema_version: "1" }),
		/schema_version/,
	);
	assert.throws(
		() => migrate({ ...sample, schema_version: 1.5 }),
		/schema_version/,
	);
});

test("a document newer than this client is rejected, and the error names the version", () => {
	const future = CURRENT_SCHEMA_VERSION + 1;
	assert.throws(
		() => migrate({ ...sample, schema_version: future }),
		new RegExp(String(future)),
	);
});

// A v1 document predates the Loadout Set rewrite too, so it carries the old
// loadout shape - migrate walks it through both steps on the way to v3, and
// the loadout comes out reset regardless (see the v2 -> v3 test below).
const oldLoadout = {
	themeIds: ["th-chrome"],
	tags: [
		{ id: "lt-1", kind: "tag", text: "reflex booster", themeId: "th-chrome" },
	],
	specials: sample.loadout.specials,
	availablePower: sample.loadout.availablePower,
	upgrade: sample.loadout.upgrade,
};
const resetLoadout = {
	sets: [],
	wildcards: 0,
	specials: sample.loadout.specials,
	availablePower: sample.loadout.availablePower,
	upgrade: sample.loadout.upgrade,
};

// v3's step always resets the crew theme, so every document that walks
// through it lands here regardless of what it carried before.
const blankCrewTheme = {
	powerTags: [],
	weaknessTags: [],
	motivation: "Identity",
	quote: "",
	specials: [],
	upgrade: 0,
	decay: 0,
};

// v4's step can't know a pre-v5 story tag was burnt - that field didn't exist
// yet - so every document walking through it lands unburnt, same as sample's
// sg-2 already is. sg-1 is the one difference from `sample` past this step.
const resetStoryTags = sample.storyTags.map((tag) => ({
	...tag,
	burnt: false,
}));

// v6's step always resets every crew relationship's burnt flag, since it
// didn't exist before, so every document that walks through it lands here
// regardless of what it carried before. cr-2 is burnt in `sample`, so this
// is the one difference from `sample` past this step.
const resetCrew = sample.crew.map((relationship) => ({
	...relationship,
	burnt: false,
}));

test("v1 -> v2 starts essenceChosen false, even with an essence already set", () => {
	const withEssence: Record<string, unknown> = {
		...sample,
		schema_version: 1,
		loadout: oldLoadout,
	};
	delete withEssence.essenceChosen;
	assert.deepEqual(migrate(withEssence), {
		...sample,
		essenceChosen: false,
		loadout: resetLoadout,
		crewTheme: blankCrewTheme,
		storyTags: resetStoryTags,
		crew: resetCrew,
		evolutionPoints: 0,
	});

	const blank: Record<string, unknown> = {
		...sample,
		schema_version: 1,
		essence: "",
		loadout: oldLoadout,
	};
	delete blank.essenceChosen;
	assert.deepEqual(migrate(blank), {
		...sample,
		essence: "",
		essenceChosen: false,
		loadout: resetLoadout,
		crewTheme: blankCrewTheme,
		storyTags: resetStoryTags,
		crew: resetCrew,
		evolutionPoints: 0,
	});
});

test("v2 -> v3 resets the loadout to the new shape, keeping the budget fields", () => {
	const old: Record<string, unknown> = {
		...sample,
		schema_version: 2,
		loadout: {
			themeIds: ["th-chrome"],
			tags: [
				{
					id: "lt-1",
					kind: "tag",
					text: "reflex booster",
					themeId: "th-chrome",
				},
			],
			specials: ["An old loadout special."],
			availablePower: 3,
			upgrade: 2,
		},
	};

	assert.deepEqual(migrate(old), {
		...sample,
		loadout: {
			sets: [],
			wildcards: 0,
			specials: ["An old loadout special."],
			availablePower: 3,
			upgrade: 2,
		},
		crewTheme: blankCrewTheme,
		storyTags: resetStoryTags,
		crew: resetCrew,
		evolutionPoints: 0,
	});
});

test("v3 -> v4 adds a blank crew theme", () => {
	const old: Record<string, unknown> = { ...sample, schema_version: 3 };
	delete old.crewTheme;

	assert.deepEqual(migrate(old), {
		...sample,
		crewTheme: blankCrewTheme,
		storyTags: resetStoryTags,
		crew: resetCrew,
		evolutionPoints: 0,
	});
});

test("v4 -> v5 drops a status's owner and a story tag's scratched flag", () => {
	const old: Record<string, unknown> = {
		...sample,
		schema_version: 4,
		statuses: sample.statuses.map((status) => {
			const { limit: _limit, ...rest } = status;
			return { ...rest, owner: "mine" };
		}),
		// v4 has no burnt/crispy concept for a story tag, only scratched, so a
		// v4 document can't have encoded sg-1's burn - the migration resets it.
		storyTags: sample.storyTags.map((tag) => {
			const { burnt: _burnt, crispy: _crispy, ...rest } = tag;
			return { ...rest, scratched: false };
		}),
	};

	assert.deepEqual(migrate(old), {
		...sample,
		storyTags: resetStoryTags,
		crew: resetCrew,
		evolutionPoints: 0,
	});
});

test("v5 -> v6 drops a status's out flag", () => {
	const old: Record<string, unknown> = {
		...sample,
		schema_version: 5,
		statuses: sample.statuses.map((status) => ({ ...status, out: false })),
	};

	assert.deepEqual(migrate(old), {
		...sample,
		crew: resetCrew,
		evolutionPoints: 0,
	});
});

test("v6 -> v7 adds burnt to a crew relationship", () => {
	const old: Record<string, unknown> = {
		...sample,
		schema_version: 6,
		crew: sample.crew.map((relationship) => {
			const { burnt: _burnt, ...rest } = relationship;
			return rest;
		}),
	};

	assert.deepEqual(migrate(old), {
		...sample,
		crew: resetCrew,
		evolutionPoints: 0,
	});
});

test("v7 -> v8 starts the Evolution track empty", () => {
	const old: Record<string, unknown> = { ...sample, schema_version: 7 };
	delete old.evolutionPoints;

	assert.deepEqual(migrate(old), { ...sample, evolutionPoints: 0 });
});
