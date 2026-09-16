import assert from "node:assert/strict";
import { test } from "node:test";
import { decayFull, loseTheme } from "../loss.ts";
import { newTheme } from "../new.ts";
import { addPowerTag, isNascent, markTrack } from "../theme.ts";
import type { Character } from "../types.ts";
import { sample } from "./sample.ts";

// Specials, a cross-themebook tag, a weakness, a quote, Decay already full.
const LANTERN = "th-lantern";
const lantern = sample.themes[1];

const memory = { id: "gm-new", lostAt: "2026-09-14T12:00:00.000Z", reason: "Blazed out on the pier." };

const find = (character: Character, id: string) => character.themes.find((one) => one.id === id);

/** What the reducer's markTrack case does, one theme at a time. */
function mark(character: Character, themeId: string): Character {
  return {
    ...character,
    themes: character.themes.map((theme) =>
      theme.id === themeId ? markTrack(theme, "decay") : theme,
    ),
  };
}

test("a lost theme reads back complete", () => {
  const next = loseTheme(sample, LANTERN, memory);
  const ghost = next.ghostMemories.at(-1);

  assert.equal(find(next, LANTERN), undefined);
  assert.equal(next.themes.length, sample.themes.length - 1);

  assert.ok(ghost);
  assert.deepEqual(ghost.theme, lantern);
  assert.deepEqual(ghost.theme.powerTags, lantern.powerTags);
  assert.deepEqual(ghost.theme.weaknessTags, lantern.weaknessTags);
  assert.deepEqual(ghost.theme.specials, lantern.specials);
  assert.equal(ghost.theme.quote, lantern.quote);
  assert.equal(ghost.theme.themebook, lantern.themebook);
  assert.equal(ghost.theme.upgrade, lantern.upgrade);
  assert.equal(ghost.theme.decay, lantern.decay);
});

test("the caller's id, timestamp, and reason are what the archive keeps", () => {
  const next = loseTheme(sample, LANTERN, memory);
  const ghost = next.ghostMemories.at(-1);

  assert.equal(ghost?.id, "gm-new");
  assert.equal(ghost?.lostAt, "2026-09-14T12:00:00.000Z");
  assert.equal(ghost?.reason, "Blazed out on the pier.");
  // The earlier memory is still there, and the new one is last.
  assert.equal(next.ghostMemories.length, sample.ghostMemories.length + 1);
  assert.deepEqual(next.ghostMemories[0], sample.ghostMemories[0]);
});

test("losing a theme leaves the document it was read from alone", () => {
  loseTheme(sample, LANTERN, memory);

  assert.ok(find(sample, LANTERN));
  assert.equal(sample.ghostMemories.length, 1);
});

test("a theme id that is not there loses nothing", () => {
  assert.equal(loseTheme(sample, "th-nowhere", memory), sample);
});

test("losing a theme never touches the loadout, which no longer references core themes", () => {
  const next = loseTheme(sample, LANTERN, memory);
  assert.deepEqual(next.loadout, sample.loadout);
});

test("a filled Decay track never loses the theme by itself", () => {
  const two: Character = mark(mark(sample, "th-chrome"), "th-chrome");
  assert.equal(find(two, "th-chrome")?.decay, 2);

  const full = mark(two, "th-chrome");
  assert.equal(find(full, "th-chrome")?.decay, 3);
  assert.ok(decayFull(find(full, "th-chrome")!));

  // The whole point of T55: the track fills and the theme stays put.
  assert.equal(full.themes.length, sample.themes.length);
  assert.deepEqual(full.ghostMemories, sample.ghostMemories);
});

test("a full Decay track wraps back to empty on the next click", () => {
  const wrapped = mark(sample, LANTERN);

  assert.equal(find(wrapped, LANTERN)?.decay, 0);
  assert.equal(decayFull(find(wrapped, LANTERN)!), false);
  assert.equal(wrapped.themes.length, sample.themes.length);
});

test("a theme is nascent until it has 3 power tags", () => {
  let theme = newTheme("th-new");
  assert.equal(isNascent(theme), true);

  theme = addPowerTag(theme, "pt-1", "A");
  theme = addPowerTag(theme, "pt-2", "B");
  assert.equal(isNascent(theme), true);

  theme = addPowerTag(theme, "pt-3", "C");
  assert.equal(isNascent(theme), false);
});

test("a replacement is blank apart from the id it was given", () => {
  const replacement = newTheme("th-new");

  assert.equal(replacement.id, "th-new");
  assert.deepEqual(replacement.powerTags, []);
  assert.deepEqual(replacement.weaknessTags, []);
  assert.deepEqual(replacement.specials, []);
  assert.equal(replacement.themebook, "");
  assert.equal(replacement.quote, "");
  assert.equal(replacement.upgrade, 0);
  assert.equal(replacement.decay, 0);
});
