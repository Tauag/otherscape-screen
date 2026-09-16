import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addPowerTag,
  addWeaknessTag,
  deletePowerTag,
  editPowerTag,
  moveTag,
  themeLine,
  themeTitle,
} from "../theme.ts";
import type { Theme } from "../types.ts";
import { sample } from "./sample.ts";

// Power tags A, C, C: the repeat-letter case the whole design turns on.
const past = sample.themes[0];

const ids = (theme: Theme) => theme.powerTags.map((tag) => tag.id);

test("a tag moves up and down, and the ends hold", () => {
  assert.deepEqual(ids(past), ["pt-1", "pt-2", "pt-3"]);

  assert.deepEqual(ids(moveTag(past, "power", "pt-2", "up")), ["pt-2", "pt-1", "pt-3"]);
  assert.deepEqual(ids(moveTag(past, "power", "pt-2", "down")), ["pt-1", "pt-3", "pt-2"]);

  assert.deepEqual(ids(moveTag(past, "power", "pt-1", "up")), ids(past));
  assert.deepEqual(ids(moveTag(past, "power", "pt-3", "down")), ids(past));
});

test("a move keeps every tag whole and moves nothing else", () => {
  const moved = moveTag(past, "power", "pt-3", "up");

  assert.deepEqual([...ids(moved)].sort(), [...ids(past)].sort());
  assert.deepEqual(moved.powerTags[1], past.powerTags[2]);
  assert.deepEqual(moved.weaknessTags, past.weaknessTags);
});

test("weakness tags reorder on their own list", () => {
  const two = addWeaknessTag(past, "wt-new", "B");
  const moved = moveTag(two, "weakness", "wt-new", "up");

  assert.deepEqual(
    moved.weaknessTags.map((tag) => tag.id),
    ["wt-new", "wt-1"],
  );
  assert.deepEqual(moved.powerTags, past.powerTags);
});

test("a question answered twice gives two tags that edit independently", () => {
  const added = addPowerTag(past, "pt-new", "C");
  const marked = added.powerTags.filter((tag) => tag.letter === "C");

  assert.equal(marked.length, 3);
  assert.equal(new Set(marked.map((tag) => tag.id)).size, 3);

  const edited = editPowerTag(added, "pt-new", { text: "a second favour" });
  assert.equal(edited.powerTags.find((tag) => tag.id === "pt-new")?.text, "a second favour");
  assert.equal(edited.powerTags.find((tag) => tag.id === "pt-2")?.text, past.powerTags[1].text);
});

test("a new tag borrows the theme's themebook and keeps the field writable", () => {
  const added = addPowerTag(past, "pt-new", "F");
  assert.equal(added.powerTags.at(-1)?.themebook, past.themebook);

  const borrowed = editPowerTag(added, "pt-new", { themebook: "Esoterica" });
  assert.equal(borrowed.powerTags.at(-1)?.themebook, "Esoterica");
});

test("the theme's title is the first power tag answering question A", () => {
  const blank: Theme = { ...past, powerTags: [] };

  const first = addPowerTag(blank, "pt-a", "A");
  assert.equal(themeTitle(first)?.id, "pt-a");

  assert.equal(themeTitle(addPowerTag(first, "pt-b", "A"))?.id, "pt-a");
  assert.equal(themeTitle(addPowerTag(blank, "pt-c", "C")), undefined);
});

test("deleting the title tag clears the title and leaves the rest", () => {
  const gone = deletePowerTag(past, "pt-1");

  assert.equal(themeTitle(gone), undefined);
  assert.deepEqual(ids(gone), ["pt-2", "pt-3"]);

  assert.equal(themeTitle(deletePowerTag(past, "pt-2"))?.id, "pt-1");
});

test("the quote line is named by the theme type", () => {
  assert.equal(themeLine("self"), "Identity");
  assert.equal(themeLine("mythos"), "Ritual");
  assert.equal(themeLine("noise"), "Itch");
});
