import assert from "node:assert/strict";
import { test } from "node:test";
import { initials } from "../initials.ts";

test("initials takes the first letter of up to two words, uppercase", () => {
	assert.equal(initials("Mira Voss"), "MV");
	assert.equal(initials("mira"), "M");
	assert.equal(initials("Mira Jane Voss"), "MJ");
	assert.equal(initials("  Mira   Voss  "), "MV");
});

test("a nameless character shows nothing", () => {
	assert.equal(initials(""), "");
	assert.equal(initials("   "), "");
});
