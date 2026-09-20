import assert from "node:assert/strict";
import { test } from "node:test";
import { newCharacter } from "@/lib/character/new";
import type { Character, TierMarks } from "@/lib/character/types";
import { STARTING_THEMES } from "@/lib/rules/constants";
import { reduce } from "../reducer.ts";

test("addTheme stops at the cap", () => {
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
	}
	assert.equal(character.themes.length, STARTING_THEMES);

	const atCap = reduce(character, { type: "addTheme", id: "one-too-many" });
	assert.equal(atCap.themes.length, STARTING_THEMES);
	assert.equal(atCap, character); // no-op: same reference, not just same length
});

test("essence assigns itself once 4 themes give an unambiguous mix", () => {
	let character = newCharacter();
	// newTheme defaults every theme to "self", an unambiguous mix (-> Real).
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
	}
	assert.equal(character.essence, "Real");
});

test("essence still assigns itself when the 4th theme completes a mixed but unambiguous set", () => {
	// A newly added theme always starts "self" (lib/character/new.ts), so the
	// mix at the 4-theme threshold always includes "self". mythos+self has one
	// candidate (Spiritualist); a pure "mythos" tie needs every theme to be
	// mythos, which the 4th theme can't be yet at the moment it is added -
	// that tie is covered directly on essenceCandidates() in
	// lib/rules/__tests__/essence.test.ts instead.
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
		if (i < STARTING_THEMES - 1) {
			character = reduce(character, {
				type: "setThemeType",
				themeId: `theme-${i}`,
				themeType: "mythos",
			});
		}
	}
	assert.equal(character.essence, "Spiritualist");
});

test("auto-assignment never overrides a choice the player already made", () => {
	let character = newCharacter();
	character = reduce(character, { type: "setEssence", essence: "Nexus" });
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
	}
	assert.equal(character.essence, "Nexus");
});

test("essence keeps tracking a theme type change until the player picks", () => {
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
	}
	assert.equal(character.essence, "Real"); // all-self, auto-assigned

	character = reduce(character, {
		type: "setThemeType",
		themeId: "theme-0",
		themeType: "mythos",
	});
	assert.equal(character.essence, "Spiritualist"); // mythos+self, still unchosen

	// Every theme mythos: a tie the app can't resolve on its own.
	for (let i = 1; i < STARTING_THEMES; i++) {
		character = reduce(character, {
			type: "setThemeType",
			themeId: `theme-${i}`,
			themeType: "mythos",
		});
	}
	assert.equal(character.essence, "");
});

test("losing a theme drops the auto-assigned essence, gaining one back reassigns it", () => {
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
	}
	assert.equal(character.essence, "Real");

	character = reduce(character, {
		type: "loseTheme",
		themeId: "theme-0",
		id: "gm-1",
		lostAt: "2026-09-16T00:00:00.000Z",
		reason: "test",
	});
	assert.equal(character.themes.length, STARTING_THEMES - 1);
	assert.equal(character.essence, "");

	character = reduce(character, { type: "addTheme", id: "theme-replacement" });
	assert.equal(character.essence, "Real");
});

test("changing a theme's type clears its themebook, since a themebook belongs to one type", () => {
	let character = newCharacter();
	character = reduce(character, { type: "addTheme", id: "theme-0" });
	character = reduce(character, {
		type: "setThemebook",
		themeId: "theme-0",
		themebook: "Affiliation",
	});

	character = reduce(character, {
		type: "setThemeType",
		themeId: "theme-0",
		themeType: "mythos",
	});
	assert.equal(character.themes[0].themebook, "");

	// Re-picking the type it already has is not a change: leave the choice alone.
	character = reduce(character, {
		type: "setThemebook",
		themeId: "theme-0",
		themebook: "Artifact",
	});
	character = reduce(character, {
		type: "setThemeType",
		themeId: "theme-0",
		themeType: "mythos",
	});
	assert.equal(character.themes[0].themebook, "Artifact");
});

test("a player's chosen essence survives theme edits that would otherwise re-suggest", () => {
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
	}
	character = reduce(character, { type: "setEssence", essence: "Nexus" });

	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, {
			type: "setThemeType",
			themeId: `theme-${i}`,
			themeType: "mythos",
		});
	}
	assert.equal(character.essence, "Nexus");

	character = reduce(character, {
		type: "loseTheme",
		themeId: "theme-0",
		id: "gm-1",
		lostAt: "2026-09-16T00:00:00.000Z",
		reason: "test",
	});
	assert.equal(character.essence, "Nexus");
});

test("breaking a Mythos-only tie picks a candidate without freezing it", () => {
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
		character = reduce(character, {
			type: "setThemeType",
			themeId: `theme-${i}`,
			themeType: "mythos",
		});
	}
	assert.equal(character.essence, ""); // tied: Avatar or Conduit, neither auto-picked

	character = reduce(character, { type: "setEssence", essence: "Avatar" });
	assert.equal(character.essence, "Avatar");
	assert.equal(character.essenceChosen, false);

	// Breaking the tie away from Avatar re-suggests instead of overriding.
	character = reduce(character, {
		type: "setThemeType",
		themeId: "theme-0",
		themeType: "self",
	});
	assert.equal(character.essence, "Spiritualist");
});

test("picking an Essence the mix does not suggest freezes it", () => {
	let character = newCharacter();
	for (let i = 0; i < STARTING_THEMES; i++) {
		character = reduce(character, { type: "addTheme", id: `theme-${i}` });
		character = reduce(character, {
			type: "setThemeType",
			themeId: `theme-${i}`,
			themeType: "mythos",
		});
	}
	character = reduce(character, { type: "setEssence", essence: "Nexus" });
	assert.equal(character.essenceChosen, true);

	character = reduce(character, {
		type: "setThemeType",
		themeId: "theme-0",
		themeType: "self",
	});
	assert.equal(character.essence, "Nexus"); // frozen, mix now suggests Spiritualist instead
});

test("a loadout set goes from added, to titled, to loaded, to holding a loaded feature", () => {
	let character = newCharacter();
	character = reduce(character, { type: "addLoadoutSet", id: "ls-1" });
	assert.equal(character.loadout.sets.length, 1);

	character = reduce(character, {
		type: "editLoadoutSetTitle",
		setId: "ls-1",
		text: "toolkit",
	});
	assert.equal(character.loadout.sets[0].title, "toolkit");

	character = reduce(character, {
		type: "addLoadoutFeature",
		setId: "ls-1",
		id: "lf-1",
	});
	character = reduce(character, {
		type: "toggleLoadoutFeature",
		setId: "ls-1",
		featureId: "lf-1",
	});
	assert.equal(
		character.loadout.sets[0].features[0].loaded,
		false,
		"a feature can't load before its title",
	);

	character = reduce(character, {
		type: "toggleLoadoutSetTitle",
		setId: "ls-1",
	});
	character = reduce(character, {
		type: "toggleLoadoutFeature",
		setId: "ls-1",
		featureId: "lf-1",
	});
	assert.equal(character.loadout.sets[0].titleLoaded, true);
	assert.equal(character.loadout.sets[0].features[0].loaded, true);

	character = reduce(character, {
		type: "toggleLoadoutSetTitle",
		setId: "ls-1",
	});
	assert.equal(
		character.loadout.sets[0].features[0].loaded,
		false,
		"unloading the title cascades",
	);

	character = reduce(character, { type: "removeLoadoutSet", setId: "ls-1" });
	assert.deepEqual(character.loadout.sets, []);
});

test("the crew theme takes a power tag, gets a title, and marks its tracks", () => {
	let character = newCharacter();
	character = reduce(character, {
		type: "addCrewPowerTag",
		id: "cpt-1",
		letter: "A",
	});
	assert.equal(character.crewTheme.powerTags[0].text, "");

	character = reduce(character, {
		type: "editCrewPowerTag",
		tagId: "cpt-1",
		edit: { text: "the Lantern Street crew" },
	});
	assert.equal(
		character.crewTheme.powerTags[0].text,
		"the Lantern Street crew",
	);

	character = reduce(character, {
		type: "setCrewMotivation",
		motivation: "Ritual",
	});
	assert.equal(character.crewTheme.motivation, "Ritual");

	character = reduce(character, { type: "markCrewTrack", track: "decay" });
	assert.equal(character.crewTheme.decay, 1);

	// Untouched: the crew theme lives outside themes[], so this stays 0.
	assert.equal(character.themes.length, 0);
});

test("a crew relationship is added blank, edited by field, and removed", () => {
	let character = newCharacter();
	character = reduce(character, { type: "addCrewRelationship", id: "cr-1" });
	assert.deepEqual(character.crew, [
		{ id: "cr-1", member: "", tag: "", burnt: false },
	]);

	character = reduce(character, {
		type: "editCrewRelationship",
		id: "cr-1",
		edit: { member: "Tamsin" },
	});
	character = reduce(character, {
		type: "editCrewRelationship",
		id: "cr-1",
		edit: { tag: "she talked me off a ledge once" },
	});
	assert.deepEqual(character.crew, [
		{
			id: "cr-1",
			member: "Tamsin",
			tag: "she talked me off a ledge once",
			burnt: false,
		},
	]);

	character = reduce(character, {
		type: "removeCrewRelationship",
		id: "cr-1",
	});
	assert.deepEqual(character.crew, []);
});

test("a crew relationship burns and un-burns, reversibly and without a burn value", () => {
	let character = newCharacter();
	character = reduce(character, { type: "addCrewRelationship", id: "cr-1" });

	character = reduce(character, {
		type: "burnCrewRelationship",
		id: "cr-1",
	});
	assert.equal(character.crew[0].burnt, true);

	character = reduce(character, {
		type: "unburnCrewRelationship",
		id: "cr-1",
	});
	assert.equal(character.crew[0].burnt, false);
});

test("marking Evolution points cycles 0 to 5 and wraps, never granting a Moment itself", () => {
	let character = newCharacter();
	for (let i = 0; i < 5; i++) {
		character = reduce(character, { type: "markEvolutionPoints" });
	}
	assert.equal(character.evolutionPoints, 5);
	assert.deepEqual(character.evolutions, newCharacter().evolutions);

	character = reduce(character, { type: "markEvolutionPoints" });
	assert.equal(character.evolutionPoints, 0);
});

test("toggling a Moment of Evolution flips only that one field", () => {
	let character = newCharacter();
	character = reduce(character, {
		type: "toggleEvolutionMoment",
		moment: "sunderTheCosmology",
	});
	assert.deepEqual(character.evolutions, {
		...newCharacter().evolutions,
		sunderTheCosmology: true,
	});

	character = reduce(character, {
		type: "toggleEvolutionMoment",
		moment: "sunderTheCosmology",
	});
	assert.deepEqual(character.evolutions, newCharacter().evolutions);
});

test("Gain a Veteran Special cycles 0 to 3 and wraps", () => {
	let character = newCharacter();
	for (let i = 0; i < 3; i++) {
		character = reduce(character, { type: "markVeteranSpecialsMoment" });
	}
	assert.equal(character.evolutions.veteranSpecials, 3);

	character = reduce(character, { type: "markVeteranSpecialsMoment" });
	assert.equal(character.evolutions.veteranSpecials, 0);
});

test("a veteran special is added once and removed by name", () => {
	let character = newCharacter();
	character = reduce(character, {
		type: "addVeteranSpecial",
		special: "Backpack Beast — wildcards cost 1 Power.",
	});
	character = reduce(character, {
		type: "addVeteranSpecial",
		special: "Backpack Beast — wildcards cost 1 Power.",
	});
	assert.deepEqual(character.veteranSpecials, [
		"Backpack Beast — wildcards cost 1 Power.",
	]);

	character = reduce(character, {
		type: "removeVeteranSpecial",
		special: "Backpack Beast — wildcards cost 1 Power.",
	});
	assert.deepEqual(character.veteranSpecials, []);
});

test("wildcards increment and decrement, clamped at 0", () => {
	let character = newCharacter();
	character = reduce(character, { type: "decrementWildcards" });
	assert.equal(character.loadout.wildcards, 0);

	character = reduce(character, { type: "incrementWildcards" });
	character = reduce(character, { type: "incrementWildcards" });
	assert.equal(character.loadout.wildcards, 2);

	character = reduce(character, { type: "decrementWildcards" });
	assert.equal(character.loadout.wildcards, 1);
});

/** "1,3" reads as tiers 1 and 3 marked, over a 6-tier track. */
function marks(tiers: string): TierMarks {
	const wanted = new Set(tiers.split(",").filter(Boolean).map(Number));
	return [1, 2, 3, 4, 5, 6].map((tier) => wanted.has(tier));
}

/** A character carrying one status, marked at the given tiers. */
function withStatus(tiers: string): Character {
	const character = reduce(newCharacter(), {
		type: "addStatus",
		id: "st-1",
		valence: "negative",
	});
	return {
		...character,
		statuses: [{ ...character.statuses[0], tiers: marks(tiers) }],
	};
}

test("a status is added at tier 1, on the sheet, and in play", () => {
	const character = reduce(newCharacter(), {
		type: "addStatus",
		id: "st-1",
		valence: "positive",
	});
	assert.deepEqual(character.statuses, [
		{
			id: "st-1",
			name: "",
			valence: "positive",
			tiers: marks("1"),
			limit: 6,
		},
	]);
});

test("a raise moves the status one tier up", () => {
	const character = reduce(withStatus("1"), {
		type: "raiseStatus",
		id: "st-1",
	});
	assert.deepEqual(character.statuses[0].tiers, marks("1,2"));
});

test("a raise onto an occupied tier lands one tier higher again", () => {
	const character = reduce(withStatus("1,2"), {
		type: "raiseStatus",
		id: "st-1",
	});
	assert.deepEqual(character.statuses[0].tiers, marks("1,2,3"));
});

test("a raise at tier 6 leaves the status as it was", () => {
	const character = reduce(withStatus("6"), {
		type: "raiseStatus",
		id: "st-1",
	});
	assert.deepEqual(character.statuses[0].tiers, marks("6"));
});

test("a lower moves every mark one tier down", () => {
	const character = reduce(withStatus("1,3"), {
		type: "lowerStatus",
		id: "st-1",
	});
	assert.deepEqual(character.statuses[0].tiers, marks("2"));
});

test("lowering a tier-1 status takes it off the table", () => {
	const character = reduce(withStatus("1"), {
		type: "lowerStatus",
		id: "st-1",
	});
	assert.deepEqual(character.statuses, []);
});

test("a lower leaves every other status alone", () => {
	const one = withStatus("1");
	const two: Character = {
		...one,
		statuses: [
			...one.statuses,
			{
				id: "st-2",
				name: "shaken",
				valence: "negative",
				tiers: marks("2"),
				limit: 6,
			},
		],
	};

	const character = reduce(two, { type: "lowerStatus", id: "st-1" });
	assert.deepEqual(
		character.statuses.map((status) => status.id),
		["st-2"],
	);
	assert.deepEqual(character.statuses[0].tiers, marks("2"));
});

test("marking a tier directly applies the stacking rule at that tier alone", () => {
	// Tiers 2 and 4 already marked; an effect targets tier 3 specifically.
	const character = reduce(withStatus("2,4"), {
		type: "markStatusTier",
		id: "st-1",
		tier: 3,
	});
	assert.deepEqual(character.statuses[0].tiers, marks("2,3,4"));
});

test("marking an already-marked tier cascades to the next open one", () => {
	const character = reduce(withStatus("2,3"), {
		type: "markStatusTier",
		id: "st-1",
		tier: 2,
	});
	assert.deepEqual(character.statuses[0].tiers, marks("2,3,4"));
});

test("clearing a tier erases only that one mark, no shifting", () => {
	const character = reduce(withStatus("2,4"), {
		type: "clearStatusTier",
		id: "st-1",
		tier: 2,
	});
	assert.deepEqual(character.statuses[0].tiers, marks("4"));
});

test("raising a status's limit pads the track without disturbing its marks", () => {
	const character = reduce(withStatus("2,4"), {
		type: "setStatusLimit",
		id: "st-1",
		limit: 8,
	});
	assert.equal(character.statuses[0].limit, 8);
	assert.deepEqual(character.statuses[0].tiers, [
		false,
		true,
		false,
		true,
		false,
		false,
		false,
		false,
	]);
});

test("lowering a status's limit truncates marks above it", () => {
	const character = reduce(withStatus("2,4"), {
		type: "setStatusLimit",
		id: "st-1",
		limit: 3,
	});
	assert.equal(character.statuses[0].limit, 3);
	assert.deepEqual(character.statuses[0].tiers, [false, true, false]);
});

test("a bad limit throws, naming the value", () => {
	assert.throws(
		() =>
			reduce(withStatus("1"), { type: "setStatusLimit", id: "st-1", limit: 0 }),
		/got 0/,
	);
	assert.throws(
		() =>
			reduce(withStatus("1"), {
				type: "setStatusLimit",
				id: "st-1",
				limit: 1.5,
			}),
		/got 1.5/,
	);
});

test("a status name is lowercased and kebab-cased as it's typed", () => {
	const character = reduce(withStatus("2"), {
		type: "renameStatus",
		id: "st-1",
		name: "Amped Up",
	});
	assert.equal(character.statuses[0].name, "amped-up");
});

test("a status is renamed, re-valenced, and deleted", () => {
	let character = reduce(withStatus("2"), {
		type: "renameStatus",
		id: "st-1",
		name: "exhausted",
	});
	assert.equal(character.statuses[0].name, "exhausted");

	character = reduce(character, {
		type: "setStatusValence",
		id: "st-1",
		valence: "positive",
	});
	assert.equal(character.statuses[0].valence, "positive");

	character = reduce(character, { type: "removeStatus", id: "st-1" });
	assert.deepEqual(character.statuses, []);
});

test("a story tag is added unburnt and not crispy, then named", () => {
	let character = reduce(newCharacter(), {
		type: "addStoryTag",
		id: "sg-1",
		valence: "positive",
	});
	assert.deepEqual(character.storyTags, [
		{
			id: "sg-1",
			name: "",
			valence: "positive",
			burnt: false,
			crispy: false,
		},
	]);

	character = reduce(character, {
		type: "renameStoryTag",
		id: "sg-1",
		name: "hole in the fence",
	});
	assert.equal(character.storyTags[0].name, "hole in the fence");
});

test("burning a story tag is reversible", () => {
	let character = reduce(newCharacter(), {
		type: "addStoryTag",
		id: "sg-1",
		valence: "positive",
	});

	character = reduce(character, {
		type: "burnStoryTag",
		id: "sg-1",
		burnValue: 3,
	});
	assert.equal(character.storyTags[0].burnt, true);
	assert.equal(character.storyTags[0].burnValue, undefined); // 3 is the default, so it stays absent.

	character = reduce(character, { type: "unburnStoryTag", id: "sg-1" });
	assert.equal(character.storyTags[0].burnt, false);
	assert.equal(character.storyTags[0].burnValue, undefined);
});

test("a crispy story tag cannot be burnt", () => {
	let character = reduce(newCharacter(), {
		type: "addStoryTag",
		id: "sg-1",
		valence: "positive",
	});
	character = reduce(character, { type: "toggleStoryTagCrispy", id: "sg-1" });
	assert.equal(character.storyTags[0].crispy, true);

	character = reduce(character, {
		type: "burnStoryTag",
		id: "sg-1",
		burnValue: 3,
	});
	assert.equal(character.storyTags[0].burnt, false);
});

test("a negative story tag cannot be burnt", () => {
	let character = reduce(newCharacter(), {
		type: "addStoryTag",
		id: "sg-1",
		valence: "negative",
	});
	character = reduce(character, {
		type: "burnStoryTag",
		id: "sg-1",
		burnValue: 3,
	});
	assert.equal(character.storyTags[0].burnt, false);
});

test("a story tag changes valence and is deleted", () => {
	let character = reduce(newCharacter(), {
		type: "addStoryTag",
		id: "sg-1",
		valence: "positive",
	});

	character = reduce(character, {
		type: "setStoryTagValence",
		id: "sg-1",
		valence: "negative",
	});
	assert.equal(character.storyTags[0].valence, "negative");

	character = reduce(character, { type: "removeStoryTag", id: "sg-1" });
	assert.deepEqual(character.storyTags, []);
});

test("a story tag verb leaves every other tag alone", () => {
	let character = newCharacter();
	character = reduce(character, {
		type: "addStoryTag",
		id: "sg-1",
		valence: "positive",
	});
	character = reduce(character, {
		type: "addStoryTag",
		id: "sg-2",
		valence: "positive",
	});

	character = reduce(character, {
		type: "burnStoryTag",
		id: "sg-2",
		burnValue: 3,
	});
	assert.equal(character.storyTags[0].burnt, false);
	assert.equal(character.storyTags[1].burnt, true);

	character = reduce(character, { type: "removeStoryTag", id: "sg-2" });
	assert.deepEqual(
		character.storyTags.map((tag) => tag.id),
		["sg-1"],
	);
});
