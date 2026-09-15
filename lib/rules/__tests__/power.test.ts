import assert from "node:assert/strict";
import { test } from "node:test";
import type { PowerTag } from "../../character/types.ts";
import { DEFAULT_BURN_VALUE } from "../constants.ts";
import { burnValueOf, power, type RollSelection } from "../power.ts";

function selection(over: Partial<RollSelection> = {}): RollSelection {
  return { tags: [], statuses: [], modifier: 0, ...over };
}

test("a positive tag adds 1 and a negative tag subtracts 1", () => {
  const { lines, total } = power(
    selection({
      tags: [
        { label: "ex-corpsec detective", valence: "positive" },
        { label: "shaking hands", valence: "negative" },
      ],
    }),
  );
  assert.deepEqual(lines, [
    { label: "ex-corpsec detective", value: 1, counted: true },
    { label: "shaking hands", value: -1, counted: true },
  ]);
  assert.equal(total, 0);
});

test("only the highest tier each side counts, and the outranked status stays in the lines", () => {
  const { lines, total } = power(
    selection({
      statuses: [
        { label: "traced-1", valence: "negative", tier: 1 },
        { label: "amped-up-2", valence: "positive", tier: 2 },
        { label: "exhausted-3", valence: "negative", tier: 3 },
      ],
    }),
  );
  assert.deepEqual(lines, [
    { label: "traced-1", value: -1, counted: false },
    { label: "amped-up-2", value: 2, counted: true },
    { label: "exhausted-3", value: -3, counted: true },
  ]);
  assert.equal(total, -1);
});

test("a tie goes to the first status in input order", () => {
  const { lines, total } = power(
    selection({
      statuses: [
        { label: "amped-up-2", valence: "positive", tier: 2 },
        { label: "in-the-zone-2", valence: "positive", tier: 2 },
      ],
    }),
  );
  assert.deepEqual(
    lines.map((line) => line.counted),
    [true, false],
  );
  assert.equal(total, 2);
});

test("a burn adds its own value, at 4 and at 5", () => {
  for (const value of [4, 5]) {
    const { total } = power(
      selection({ tags: [{ label: "lantern of the dead", valence: "positive", burnValue: value }] }),
    );
    assert.equal(total, value);
  }
});

test("a burn with no recorded value adds the default", () => {
  const tag: PowerTag = {
    id: "pt-1",
    themebook: "Esoterica",
    letter: "A",
    text: "lantern of the dead",
    burnt: true,
  };
  const { total } = power(
    selection({ tags: [{ label: tag.text, valence: "positive", burnValue: burnValueOf(tag) }] }),
  );
  assert.equal(total, DEFAULT_BURN_VALUE);
  assert.equal(burnValueOf({ ...tag, burnt: false }), null);
});

test("rolling with Self replaces the positive tags but keeps negatives and statuses", () => {
  const { lines, total } = power(
    selection({
      tags: [
        { label: "ex-corpsec detective", valence: "positive", burnValue: 5 },
        { label: "shaking hands", valence: "negative" },
      ],
      statuses: [{ label: "amped-up-2", valence: "positive", tier: 2 }],
      rollWith: { type: "self", themeCount: 2 },
    }),
  );
  assert.deepEqual(lines, [
    { label: "Rolling with Self", value: 2, counted: true },
    { label: "ex-corpsec detective", value: 1, counted: false },
    { label: "shaking hands", value: -1, counted: true },
    { label: "amped-up-2", value: 2, counted: true },
  ]);
  assert.equal(total, 3);
});

test("the manual modifier is a line only when it is not 0", () => {
  assert.deepEqual(power(selection({ modifier: 0 })), { lines: [], total: 0 });
  assert.deepEqual(power(selection({ modifier: -2 })), {
    lines: [{ label: "Modifier", value: -2, counted: true }],
    total: -2,
  });
});
