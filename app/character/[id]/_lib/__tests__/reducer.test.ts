import assert from "node:assert/strict";
import { test } from "node:test";
import { newCharacter } from "@/lib/character/new";
import { STARTING_THEMES } from "@/lib/rules/constants";
import { reduce } from "../reducer.ts";

test("addTheme stops at the cap", () => {
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
  }
  assert.equal(character.themes.length, STARTING_THEMES);

  const atCap = reduce(character, { type: "addTheme", id: "one-too-many" });
  assert.equal(atCap.themes.length, STARTING_THEMES);
  assert.equal(atCap, character); // no-op: same reference, not just same length
});
