import assert from "node:assert/strict";
import { test } from "node:test";
import { groupLoadout } from "../../loadout-edit.ts";
import { loadoutSpend } from "../../rules/loadout.ts";
import { decayFull, loseTheme } from "../loss.ts";
import { newTheme } from "../new.ts";
import { markTrack } from "../theme.ts";
import type { Character, Essence } from "../types.ts";
import { sample } from "./sample.ts";

// Specials, a cross-themebook tag, a weakness, a quote, Decay already full.
const LANTERN = "th-lantern";
const lantern = sample.themes[1];

const memory = { id: "gm-new", lostAt: "2026-09-14T12:00:00.000Z", reason: "Blazed out on the pier." };

const find = (character: Character, id: string) => character.themes.find((one) => one.id === id);

/** What the reducer's markTrack case does, one theme at a time. */
function mark(character: Character, themeId: string, index: number): Character {
  return {
    ...character,
    themes: character.themes.map((theme) =>
      theme.id === themeId ? markTrack(theme, "decay", index) : theme,
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
  assert.equal(ghost.theme.titleTagId, lantern.titleTagId);
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

test("the loadout drops the lost theme's id and keeps every tag the player wrote", () => {
  const next = loseTheme(sample, LANTERN, memory);

  assert.deepEqual(next.loadout.themeIds, ["th-chrome"]);
  assert.deepEqual(next.loadout.tags, sample.loadout.tags);

  // groupLoadout sends the orphaned tag to misc, so it stays readable and
  // deletable, and the Power it spends stays honest.
  const { groups, misc } = groupLoadout(next.loadout, next.themes);
  assert.deepEqual(
    groups.map((group) => group.theme.id),
    ["th-chrome"],
  );
  assert.ok(misc.some((tag) => tag.id === "lt-3"));
  assert.equal(loadoutSpend(next.loadout).spent, loadoutSpend(sample.loadout).spent);
});

test("a filled Decay track never loses the theme by itself", () => {
  const two: Character = mark(sample, "th-chrome", 1);
  assert.equal(find(two, "th-chrome")?.decay, 2);

  const full = mark(two, "th-chrome", 2);
  assert.equal(find(full, "th-chrome")?.decay, 3);
  assert.ok(decayFull(find(full, "th-chrome")!));

  // The whole point of T55: the track fills and the theme stays put.
  assert.equal(full.themes.length, sample.themes.length);
  assert.deepEqual(full.ghostMemories, sample.ghostMemories);
});

test("a full Decay track backs out one box at a time", () => {
  const backedOut = mark(sample, LANTERN, 2);

  assert.equal(find(backedOut, LANTERN)?.decay, 2);
  assert.equal(decayFull(find(backedOut, LANTERN)!), false);
  assert.equal(backedOut.themes.length, sample.themes.length);
});

test("a Conduit's replacement starts full, and an ordinary one starts nascent", () => {
  assert.equal(newTheme("th-new", "Conduit").nascent, false);
  // A Nexus that stays a Nexus gains a full theme too.
  assert.equal(newTheme("th-new", "Nexus").nascent, false);

  const ordinary: Essence[] = ["Real", "Avatar", "Singularity", "Spiritualist", "Cyborg", "Transhuman"];
  for (const essence of ordinary) {
    assert.equal(newTheme("th-new", essence).nascent, true, `${essence} starts nascent`);
  }
  assert.equal(newTheme("th-new", "").nascent, true);
});

test("a replacement is blank apart from the id it was given", () => {
  const replacement = newTheme("th-new", "Real");

  assert.equal(replacement.id, "th-new");
  assert.equal(replacement.titleTagId, null);
  assert.deepEqual(replacement.powerTags, []);
  assert.deepEqual(replacement.weaknessTags, []);
  assert.deepEqual(replacement.specials, []);
  assert.equal(replacement.themebook, "");
  assert.equal(replacement.quote, "");
  assert.equal(replacement.upgrade, 0);
  assert.equal(replacement.decay, 0);
});
