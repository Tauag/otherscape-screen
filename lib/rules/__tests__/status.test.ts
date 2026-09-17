import assert from "node:assert/strict";
import { test } from "node:test";
import type { TierMarks } from "../../character/types.ts";
import {
	clearStatusTier,
	lowerStatus,
	raiseStatus,
	resizeStatusLimit,
} from "../status.ts";

const LIMIT = 6;

/** "1,3" reads as tiers 1 and 3 marked, over a track of `limit` tiers. */
function marks(tiers: string, limit = LIMIT): TierMarks {
	const wanted = new Set(tiers.split(",").filter(Boolean).map(Number));
	return Array.from({ length: limit }, (_, index) => wanted.has(index + 1));
}

test("a raise onto an occupied tier marks one tier higher", () => {
	assert.deepEqual(raiseStatus(marks("2"), 2, LIMIT), marks("2,3"));
});

test("a raise cascades past two occupied tiers", () => {
	assert.deepEqual(raiseStatus(marks("2,3"), 2, LIMIT), marks("2,3,4"));
});

test("a raise with nowhere to go leaves the status as it was", () => {
	const full = marks("4,5,6");
	assert.deepEqual(raiseStatus(full, 6, LIMIT), full);
	assert.deepEqual(raiseStatus(full, 4, LIMIT), full);
});

test("a raise does not mutate its input", () => {
	const before = marks("2");
	raiseStatus(before, 2, LIMIT);
	assert.deepEqual(before, marks("2"));
});

test("a raised status respects a limit past the default 6", () => {
	assert.deepEqual(raiseStatus(marks("8", 8), 8, 8), marks("8", 8));
	assert.deepEqual(raiseStatus(marks("7", 8), 7, 8), marks("7,8", 8));
});

test("removal erases a mark pushed below tier 1", () => {
	assert.deepEqual(lowerStatus(marks("1,3"), 1), marks("2"));
});

test("a multi-tier removal moves every mark that far left", () => {
	assert.deepEqual(lowerStatus(marks("2,5,6"), 2), marks("3,4"));
	assert.deepEqual(lowerStatus(marks("1,2,3"), 3), marks(""));
});

test("a bad tier or a negative removal throws, naming the value", () => {
	assert.throws(() => raiseStatus(marks(""), 0, LIMIT), /got 0/);
	assert.throws(() => raiseStatus(marks(""), 7, LIMIT), /got 7/);
	assert.throws(() => raiseStatus(marks(""), 1.5, LIMIT), /got 1.5/);
	assert.throws(() => lowerStatus(marks(""), -1), /got -1/);
});

test("clearing a tier erases only that one mark", () => {
	assert.deepEqual(clearStatusTier(marks("2,4"), 4), marks("2"));
	assert.deepEqual(clearStatusTier(marks("2,4"), 3), marks("2,4"));
});

test("resizing down truncates the top tiers", () => {
	assert.deepEqual(resizeStatusLimit(marks("2,5"), 3), marks("2", 3));
});

test("resizing up pads with unmarked tiers", () => {
	assert.deepEqual(resizeStatusLimit(marks("2"), 8), marks("2", 8));
});
