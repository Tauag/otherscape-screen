import assert from "node:assert/strict";
import { test } from "node:test";
import {
	addPowerTag,
	deletePowerTag,
	editPowerTag,
	isNascent,
	markTrack,
	moveTag,
	takeThemeUpgrade,
	themeTitle,
} from "../theme.ts";
import type { CrewTheme } from "../types.ts";
import { sample } from "./sample.ts";

// The theme verbs take the crew theme too, so these run them on one.

const crew = sample.crewTheme;

const ids = (theme: CrewTheme) => theme.powerTags.map((tag) => tag.id);

test("a crew tag moves up and down, and the ends hold", () => {
	assert.deepEqual(ids(crew), ["cpt-1", "cpt-2"]);
	assert.deepEqual(ids(moveTag(crew, "power", "cpt-2", "up")), [
		"cpt-2",
		"cpt-1",
	]);
	assert.deepEqual(ids(moveTag(crew, "power", "cpt-1", "up")), ids(crew));
});

test("the crew's title is the first power tag answering question A", () => {
	const blank: CrewTheme = { ...crew, powerTags: [] };

	const first = addPowerTag(blank, "cpt-a", "A");
	assert.equal(themeTitle(first)?.id, "cpt-a");
	assert.equal(themeTitle(addPowerTag(blank, "cpt-c", "C")), undefined);
});

test("a new crew power tag carries no themebook - there is none to borrow", () => {
	const added = addPowerTag(crew, "cpt-new", "F");
	assert.equal(added.powerTags.at(-1)?.themebook, "");
});

test("deleting the title tag clears the title and leaves the rest", () => {
	const gone = deletePowerTag(crew, "cpt-1");
	assert.equal(themeTitle(gone), undefined);
	assert.deepEqual(ids(gone), ["cpt-2"]);
});

test("editing a crew tag's text leaves its siblings untouched", () => {
	const edited = editPowerTag(crew, "cpt-2", {
		text: "a rented safehouse",
	});
	assert.equal(
		edited.powerTags.find((tag) => tag.id === "cpt-2")?.text,
		"a rented safehouse",
	);
	assert.equal(
		edited.powerTags.find((tag) => tag.id === "cpt-1")?.text,
		crew.powerTags[0].text,
	);
});

test("nascent until all three power tags exist", () => {
	assert.equal(isNascent(crew), true);
	const full = addPowerTag(crew, "cpt-3", "C");
	assert.equal(isNascent(full), false);
});

test("the Upgrade track wraps to empty once it clears, same as a theme's", () => {
	const full: CrewTheme = { ...crew, upgrade: 2 };
	assert.equal(markTrack(full, "upgrade").upgrade, 0);
	assert.equal(markTrack(crew, "decay").decay, crew.decay + 1);
});

test("filling the crew Upgrade track owes one Upgrade, same as a theme's", () => {
	const full: CrewTheme = { ...crew, upgrade: 2, pendingUpgrades: 0 };
	const filled = markTrack(full, "upgrade");
	assert.equal(filled.pendingUpgrades, 1);
	assert.equal(markTrack(crew, "decay").pendingUpgrades, crew.pendingUpgrades);
});

test("taking a crew Upgrade resolves one and never goes below zero", () => {
	assert.equal(
		takeThemeUpgrade({ ...crew, pendingUpgrades: 2 }).pendingUpgrades,
		1,
	);
	assert.equal(
		takeThemeUpgrade({ ...crew, pendingUpgrades: 0 }).pendingUpgrades,
		0,
	);
});
