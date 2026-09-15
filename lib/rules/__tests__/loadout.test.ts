import assert from "node:assert/strict";
import { test } from "node:test";
import type { Loadout, LoadoutTagKind } from "../../character/types.ts";
import { loadoutSpend } from "../loadout.ts";

function loadout(availablePower: number, ...kinds: LoadoutTagKind[]): Loadout {
  return {
    themeIds: [],
    tags: kinds.map((kind, index) => ({ id: `lt-${index}`, kind, text: kind, themeId: null })),
    specials: [],
    availablePower,
    upgrade: 0,
  };
}

test("a tag costs 1, a wildcard 2, and a flaw nothing", () => {
  const spend = loadoutSpend(loadout(4, "tag", "tag", "wildcard", "flaw"));
  assert.deepEqual(spend, { spent: 4, available: 4, over: 0, warning: null });
});

test("an empty loadout spends nothing", () => {
  assert.deepEqual(loadoutSpend(loadout(1)), { spent: 0, available: 1, over: 0, warning: null });
});

test("an over-budget loadout reports the gap as a sentence", () => {
  const spend = loadoutSpend(loadout(3, "tag", "tag", "wildcard"));
  assert.deepEqual(spend, {
    spent: 4,
    available: 3,
    over: 1,
    warning: "The loadout spends 4 Power against 3 available.",
  });
});
