import assert from "node:assert/strict";
import { test } from "node:test";
import {
	addCrewPowerTag,
	crewTitle,
	deleteCrewPowerTag,
	editCrewPowerTag,
	isCrewNascent,
	markCrewTrack,
	moveCrewTag,
} from "../crew-theme.ts";
import type { CrewTheme } from "../types.ts";
import { sample } from "./sample.ts";

const crew = sample.crewTheme;

const ids = (theme: CrewTheme) => theme.powerTags.map((tag) => tag.id);

test("a crew tag moves up and down, and the ends hold", () => {
	assert.deepEqual(ids(crew), ["cpt-1", "cpt-2"]);
	assert.deepEqual(ids(moveCrewTag(crew, "power", "cpt-2", "up")), [
		"cpt-2",
		"cpt-1",
	]);
	assert.deepEqual(ids(moveCrewTag(crew, "power", "cpt-1", "up")), ids(crew));
});

test("the crew's title is the first power tag answering question A", () => {
	const blank: CrewTheme = { ...crew, powerTags: [] };

	const first = addCrewPowerTag(blank, "cpt-a", "A");
	assert.equal(crewTitle(first)?.id, "cpt-a");
	assert.equal(crewTitle(addCrewPowerTag(blank, "cpt-c", "C")), undefined);
});

test("a new crew power tag carries no themebook - there is none to borrow", () => {
	const added = addCrewPowerTag(crew, "cpt-new", "F");
	assert.equal(added.powerTags.at(-1)?.themebook, "");
});

test("deleting the title tag clears the title and leaves the rest", () => {
	const gone = deleteCrewPowerTag(crew, "cpt-1");
	assert.equal(crewTitle(gone), undefined);
	assert.deepEqual(ids(gone), ["cpt-2"]);
});

test("editing a crew tag's text leaves its siblings untouched", () => {
	const edited = editCrewPowerTag(crew, "cpt-2", {
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
	assert.equal(isCrewNascent(crew), true);
	const full = addCrewPowerTag(crew, "cpt-3", "C");
	assert.equal(isCrewNascent(full), false);
});

test("the Upgrade track wraps to empty once it clears, same as a theme's", () => {
	const full: CrewTheme = { ...crew, upgrade: 2 };
	assert.equal(markCrewTrack(full, "upgrade").upgrade, 0);
	assert.equal(markCrewTrack(crew, "decay").decay, crew.decay + 1);
});
