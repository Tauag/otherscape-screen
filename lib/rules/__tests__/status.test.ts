import assert from "node:assert/strict";
import { test } from "node:test";
import type { TierMarks } from "../../character/types.ts";
import { lowerStatus, raiseStatus } from "../status.ts";

/** "1,3" reads as tiers 1 and 3 marked. */
function marks(tiers: string): TierMarks {
  const wanted = new Set(tiers.split(",").filter(Boolean).map(Number));
  return [1, 2, 3, 4, 5, 6].map((tier) => wanted.has(tier)) as TierMarks;
}

test("a raise onto an occupied tier marks one tier higher", () => {
  assert.deepEqual(raiseStatus(marks("2"), 2), marks("2,3"));
});

test("a raise cascades past two occupied tiers", () => {
  assert.deepEqual(raiseStatus(marks("2,3"), 2), marks("2,3,4"));
});

test("a raise with nowhere to go leaves the status as it was", () => {
  const full = marks("4,5,6");
  assert.deepEqual(raiseStatus(full, 6), full);
  assert.deepEqual(raiseStatus(full, 4), full);
});

test("a raise does not mutate its input", () => {
  const before = marks("2");
  raiseStatus(before, 2);
  assert.deepEqual(before, marks("2"));
});

test("removal erases a mark pushed below tier 1", () => {
  assert.deepEqual(lowerStatus(marks("1,3"), 1), marks("2"));
});

test("a multi-tier removal moves every mark that far left", () => {
  assert.deepEqual(lowerStatus(marks("2,5,6"), 2), marks("3,4"));
  assert.deepEqual(lowerStatus(marks("1,2,3"), 3), marks(""));
});

test("a bad tier or a negative removal throws, naming the value", () => {
  assert.throws(() => raiseStatus(marks(""), 0), /got 0/);
  assert.throws(() => raiseStatus(marks(""), 7), /got 7/);
  assert.throws(() => raiseStatus(marks(""), 1.5), /got 1.5/);
  assert.throws(() => lowerStatus(marks(""), -1), /got -1/);
});
