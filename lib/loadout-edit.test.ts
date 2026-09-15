import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "./character/__tests__/sample.ts";
import type { Loadout, LoadoutTag, LoadoutTagKind } from "./character/types.ts";
import {
  groupLoadout,
  markLoadoutUpgrade,
  takeLoadoutUpgrade,
  toggleLoadoutTheme,
} from "./loadout-edit.ts";
import { LOADOUT_TAG_COST, WILDCARD_TAG_COST } from "./rules/constants.ts";
import { loadoutSpend } from "./rules/loadout.ts";

const { loadout, themes } = sample;

const ids = (tags: LoadoutTag[]) => tags.map((tag) => tag.id);

// What the screen shows, priced from the constants. It must match loadoutSpend.
const COST: Record<LoadoutTagKind, number> = {
  tag: LOADOUT_TAG_COST,
  wildcard: WILDCARD_TAG_COST,
  flaw: 0,
};

function onScreen({ groups, misc }: ReturnType<typeof groupLoadout>): LoadoutTag[] {
  return [...groups.flatMap((group) => group.tags), ...misc];
}

test("tags group per loadout theme, in loadout order, and the rest is misc", () => {
  const { groups, misc } = groupLoadout(loadout, themes);

  assert.deepEqual(
    groups.map((group) => group.theme.id),
    ["th-chrome", "th-lantern"],
  );
  assert.deepEqual(ids(groups[0].tags), ["lt-1", "lt-2"]);
  assert.deepEqual(ids(groups[1].tags), ["lt-3"]);
  assert.deepEqual(ids(misc), ["lt-4", "lt-5"]);
});

test("a tag whose theme is not in the loadout shows under misc, never nowhere", () => {
  const orphan: Loadout = {
    ...loadout,
    tags: [...loadout.tags, { id: "lt-6", kind: "tag", text: "left behind", themeId: "th-past" }],
  };

  const grouped = groupLoadout(orphan, themes);
  assert.deepEqual(ids(grouped.misc), ["lt-4", "lt-5", "lt-6"]);
  assert.equal(onScreen(grouped).length, orphan.tags.length);
});

test("moving a theme out keeps its tags, and moving it back regroups them", () => {
  const out = toggleLoadoutTheme(loadout, "th-chrome");
  assert.deepEqual(out.themeIds, ["th-lantern"]);
  assert.deepEqual(out.tags, loadout.tags);

  const grouped = groupLoadout(out, themes);
  assert.deepEqual(
    grouped.groups.map((group) => group.theme.id),
    ["th-lantern"],
  );
  assert.deepEqual(ids(grouped.misc), ["lt-1", "lt-2", "lt-4", "lt-5"]);
  assert.equal(loadoutSpend(out).spent, loadoutSpend(loadout).spent);

  const back = toggleLoadoutTheme(out, "th-chrome");
  assert.deepEqual(ids(groupLoadout(back, themes).groups[1].tags), ["lt-1", "lt-2"]);
});

test("a track box marks up to itself, or unmarks itself and what follows", () => {
  assert.equal(markLoadoutUpgrade(0, 0), 1);
  assert.equal(markLoadoutUpgrade(1, 2), 3);
  assert.equal(markLoadoutUpgrade(3, 2), 2);
  assert.equal(markLoadoutUpgrade(3, 0), 0);
});

test("taking the Upgrade as Power clears the track and adds 1 available Power", () => {
  const full: Loadout = { ...loadout, upgrade: markLoadoutUpgrade(2, 2) };
  const taken = takeLoadoutUpgrade(full, "power");

  assert.equal(taken.upgrade, 0);
  assert.equal(taken.availablePower, loadout.availablePower + 1);
  assert.deepEqual(taken.specials, loadout.specials);
  assert.equal(loadoutSpend(taken).available, loadoutSpend(loadout).available + 1);
});

test("taking the Upgrade as a special clears the track and appends an empty special", () => {
  const full: Loadout = { ...loadout, upgrade: markLoadoutUpgrade(2, 2) };
  const taken = takeLoadoutUpgrade(full, "special");

  assert.equal(taken.upgrade, 0);
  assert.deepEqual(taken.specials, [...loadout.specials, ""]);
  assert.equal(taken.availablePower, loadout.availablePower);
});

test("the budget on screen agrees with loadoutSpend", () => {
  const priced = (tags: LoadoutTag[]) => tags.reduce((total, tag) => total + COST[tag.kind], 0);

  // Two tags, one wildcard, two flaws, across two themes and misc.
  assert.equal(priced(onScreen(groupLoadout(loadout, themes))), loadoutSpend(loadout).spent);
  assert.deepEqual(loadoutSpend(loadout), {
    spent: 4,
    available: 4,
    over: 0,
    warning: null,
  });

  const tight: Loadout = { ...loadout, availablePower: 1 };
  assert.equal(priced(onScreen(groupLoadout(tight, themes))), loadoutSpend(tight).spent);
  assert.equal(
    loadoutSpend(tight).warning,
    "The loadout spends 4 Power against 1 available.",
  );
});
