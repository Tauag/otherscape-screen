import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "./character/__tests__/sample.ts";
import type { Loadout } from "./character/types.ts";
import {
  addLoadoutFeature,
  addLoadoutSet,
  addLoadoutWeakness,
  adjustLoadoutPower,
  decrementWildcards,
  editLoadoutFeature,
  editLoadoutSetTitle,
  incrementWildcards,
  markLoadoutUpgrade,
  removeLoadoutFeature,
  removeLoadoutSet,
  takeLoadoutUpgrade,
  toggleLoadoutFeature,
  toggleLoadoutSetTitle,
} from "./loadout-edit.ts";
import { loadoutSpend } from "./rules/loadout.ts";

const { loadout } = sample;

test("a new set starts with an empty, unloaded title and nothing else", () => {
  const next = addLoadoutSet(loadout, "ls-new");
  const added = next.sets.at(-1)!;
  assert.equal(added.id, "ls-new");
  assert.equal(added.title, "");
  assert.equal(added.titleLoaded, false);
  assert.deepEqual(added.features, []);
  assert.deepEqual(added.weaknesses, []);
});

test("editing a set's title touches only that set", () => {
  const next = editLoadoutSetTitle(loadout, "ls-2", "the bone lantern's whole rig");
  assert.equal(next.sets[1].title, "the bone lantern's whole rig");
  assert.equal(next.sets[0], loadout.sets[0]);
});

test("removing a set drops it and nothing else", () => {
  const next = removeLoadoutSet(loadout, "ls-1");
  assert.deepEqual(
    next.sets.map((set) => set.id),
    ["ls-2"],
  );
});

test("loading a title costs Power; unloading it cascades to every loaded feature", () => {
  // ls-2 starts with an unloaded title and an unloaded feature.
  const loaded = toggleLoadoutSetTitle(loadout, "ls-2");
  assert.equal(loaded.sets[1].titleLoaded, true);

  const withFeature = toggleLoadoutFeature(loaded, "ls-2", "lf-3");
  assert.equal(withFeature.sets[1].features[0].loaded, true);

  const unloaded = toggleLoadoutSetTitle(withFeature, "ls-2");
  assert.equal(unloaded.sets[1].titleLoaded, false);
  assert.equal(unloaded.sets[1].features[0].loaded, false, "the feature can't outlive its title");
});

test("a feature cannot load before its set's title does", () => {
  // ls-2's title starts unloaded.
  const attempted = toggleLoadoutFeature(loadout, "ls-2", "lf-3");
  assert.equal(attempted.sets[1].features[0].loaded, false);
});

test("a feature can always be unloaded, title or no title", () => {
  // ls-1's title and its first feature both start loaded.
  const next = toggleLoadoutFeature(loadout, "ls-1", "lf-1");
  assert.equal(next.sets[0].features[0].loaded, false);
});

test("adding, editing, and removing a feature touches only that set", () => {
  const added = addLoadoutFeature(loadout, "ls-1", "lf-new");
  assert.equal(added.sets[0].features.at(-1)!.text, "");
  assert.equal(added.sets[0].features.at(-1)!.loaded, false);

  const edited = editLoadoutFeature(added, "ls-1", "lf-new", "a second cartridge");
  assert.equal(edited.sets[0].features.at(-1)!.text, "a second cartridge");

  const removed = removeLoadoutFeature(edited, "ls-1", "lf-new");
  assert.deepEqual(removed.sets[0].features, loadout.sets[0].features);
});

test("adding a weakness starts it blank; it never carries a loaded flag", () => {
  const next = addLoadoutWeakness(loadout, "ls-2", "lw-new");
  assert.deepEqual(next.sets[1].weaknesses, [{ id: "lw-new", text: "" }]);
});

test("wildcards are a plain count, clamped at 0", () => {
  const up = incrementWildcards(loadout);
  assert.equal(up.wildcards, loadout.wildcards + 1);

  const zero: Loadout = { ...loadout, wildcards: 0 };
  assert.equal(decrementWildcards(zero).wildcards, 0);
});

test("available Power adjusts by hand, clamped at 0", () => {
  assert.equal(adjustLoadoutPower(loadout, 1).availablePower, loadout.availablePower + 1);

  const one: Loadout = { ...loadout, availablePower: 1 };
  assert.equal(adjustLoadoutPower(one, -1).availablePower, 0);
  assert.equal(adjustLoadoutPower(one, -5).availablePower, 0);
});

test("one click, one more box, wrapping back to empty once it fills", () => {
  const zero: Loadout = { ...loadout, upgrade: 0 };
  const one = markLoadoutUpgrade(zero);
  assert.equal(one.upgrade, 1);

  const two = markLoadoutUpgrade(one);
  assert.equal(two.upgrade, 2);

  const full = markLoadoutUpgrade(two);
  assert.equal(full.upgrade, 0, "the third click clears the track in the same click");
});

test("taking the Upgrade as Power clears the track and adds 1 available Power", () => {
  const full: Loadout = { ...loadout, upgrade: 2 };
  const taken = takeLoadoutUpgrade(full, "power");

  assert.equal(taken.upgrade, 0);
  assert.equal(taken.availablePower, loadout.availablePower + 1);
  assert.deepEqual(taken.specials, loadout.specials);
  assert.equal(loadoutSpend(taken).available, loadoutSpend(loadout).available + 1);
});

test("taking the Upgrade as a special clears the track and leaves specials alone", () => {
  // Picking one is the loadout specials picker's job, same as a theme
  // special: the Upgrade choice itself only clears the track.
  const full: Loadout = { ...loadout, upgrade: 2 };
  const taken = takeLoadoutUpgrade(full, "special");

  assert.equal(taken.upgrade, 0);
  assert.deepEqual(taken.specials, loadout.specials);
  assert.equal(taken.availablePower, loadout.availablePower);
});

test("the fixture's spend matches what's actually loaded", () => {
  // ls-1: title loaded (1) + one loaded feature (1). ls-2: title unloaded (0).
  // Plus one wildcard (2). 4 spent of 4 available.
  assert.deepEqual(loadoutSpend(loadout), { spent: 4, available: 4, over: 0, warning: null });
});
