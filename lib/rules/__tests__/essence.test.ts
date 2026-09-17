import assert from "node:assert/strict";
import { test } from "node:test";
import type { ThemeType } from "../../character/types.ts";
import { essenceCandidates } from "../essence.ts";

function themes(...types: ThemeType[]) {
	return types.map((type) => ({ type }));
}

test("every theme mix maps to its Essences", () => {
	assert.deepEqual(essenceCandidates(themes("self", "self")), ["Real"]);
	assert.deepEqual(essenceCandidates(themes("mythos")), ["Avatar", "Conduit"]);
	assert.deepEqual(essenceCandidates(themes("noise")), ["Singularity"]);
	assert.deepEqual(essenceCandidates(themes("self", "mythos")), [
		"Spiritualist",
	]);
	assert.deepEqual(essenceCandidates(themes("noise", "self")), ["Cyborg"]);
	assert.deepEqual(essenceCandidates(themes("mythos", "noise")), [
		"Transhuman",
	]);
	assert.deepEqual(essenceCandidates(themes("noise", "self", "mythos")), [
		"Nexus",
	]);
	assert.deepEqual(essenceCandidates([]), []);
});
