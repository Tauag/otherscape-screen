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

test("essence assigns itself once 4 themes give an unambiguous mix", () => {
  let character = newCharacter();
  // newTheme defaults every theme to "self", an unambiguous mix (-> Real).
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
  }
  assert.equal(character.essence, "Real");
});

test("essence still assigns itself when the 4th theme completes a mixed but unambiguous set", () => {
  // A newly added theme always starts "self" (lib/character/new.ts), so the
  // mix at the 4-theme threshold always includes "self". mythos+self has one
  // candidate (Spiritualist); a pure "mythos" tie needs every theme to be
  // mythos, which the 4th theme can't be yet at the moment it is added -
  // that tie is covered directly on essenceCandidates() in
  // lib/rules/__tests__/essence.test.ts instead.
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
    if (i < STARTING_THEMES - 1) {
      character = reduce(character, {
        type: "setThemeType",
        themeId: `theme-${i}`,
        themeType: "mythos",
      });
    }
  }
  assert.equal(character.essence, "Spiritualist");
});

test("auto-assignment never overrides a choice the player already made", () => {
  let character = newCharacter();
  character = reduce(character, { type: "setEssence", essence: "Nexus" });
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
  }
  assert.equal(character.essence, "Nexus");
});

test("essence keeps tracking a theme type change until the player picks", () => {
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
  }
  assert.equal(character.essence, "Real"); // all-self, auto-assigned

  character = reduce(character, {
    type: "setThemeType",
    themeId: "theme-0",
    themeType: "mythos",
  });
  assert.equal(character.essence, "Spiritualist"); // mythos+self, still unchosen

  // Every theme mythos: a tie the app can't resolve on its own.
  for (let i = 1; i < STARTING_THEMES; i++) {
    character = reduce(character, {
      type: "setThemeType",
      themeId: `theme-${i}`,
      themeType: "mythos",
    });
  }
  assert.equal(character.essence, "");
});

test("losing a theme drops the auto-assigned essence, gaining one back reassigns it", () => {
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
  }
  assert.equal(character.essence, "Real");

  character = reduce(character, {
    type: "loseTheme",
    themeId: "theme-0",
    id: "gm-1",
    lostAt: "2026-09-16T00:00:00.000Z",
    reason: "test",
  });
  assert.equal(character.themes.length, STARTING_THEMES - 1);
  assert.equal(character.essence, "");

  character = reduce(character, { type: "addTheme", id: "theme-replacement" });
  assert.equal(character.essence, "Real");
});

test("a player's chosen essence survives theme edits that would otherwise re-suggest", () => {
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
  }
  character = reduce(character, { type: "setEssence", essence: "Nexus" });

  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, {
      type: "setThemeType",
      themeId: `theme-${i}`,
      themeType: "mythos",
    });
  }
  assert.equal(character.essence, "Nexus");

  character = reduce(character, {
    type: "loseTheme",
    themeId: "theme-0",
    id: "gm-1",
    lostAt: "2026-09-16T00:00:00.000Z",
    reason: "test",
  });
  assert.equal(character.essence, "Nexus");
});

test("breaking a Mythos-only tie picks a candidate without freezing it", () => {
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
    character = reduce(character, {
      type: "setThemeType",
      themeId: `theme-${i}`,
      themeType: "mythos",
    });
  }
  assert.equal(character.essence, ""); // tied: Avatar or Conduit, neither auto-picked

  character = reduce(character, { type: "setEssence", essence: "Avatar" });
  assert.equal(character.essence, "Avatar");
  assert.equal(character.essenceChosen, false);

  // Breaking the tie away from Avatar re-suggests instead of overriding.
  character = reduce(character, {
    type: "setThemeType",
    themeId: "theme-0",
    themeType: "self",
  });
  assert.equal(character.essence, "Spiritualist");
});

test("picking an Essence the mix does not suggest freezes it", () => {
  let character = newCharacter();
  for (let i = 0; i < STARTING_THEMES; i++) {
    character = reduce(character, { type: "addTheme", id: `theme-${i}` });
    character = reduce(character, {
      type: "setThemeType",
      themeId: `theme-${i}`,
      themeType: "mythos",
    });
  }
  character = reduce(character, { type: "setEssence", essence: "Nexus" });
  assert.equal(character.essenceChosen, true);

  character = reduce(character, {
    type: "setThemeType",
    themeId: "theme-0",
    themeType: "self",
  });
  assert.equal(character.essence, "Nexus"); // frozen, mix now suggests Spiritualist instead
});
