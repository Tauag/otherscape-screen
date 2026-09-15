import type { Character, Theme, ThemeType } from "../character/types.ts";
import { STARTING_THEMES } from "./constants.ts";
import { loadoutSpend } from "./loadout.ts";

/** The quote line's name comes from the theme type (PRD 6). */
const LINE_NAME: Record<ThemeType, string> = {
  mythos: "Ritual",
  self: "Identity",
  noise: "Itch",
};

function themeName(theme: Theme, index: number): string {
  const themebook = theme.themebook.trim();
  return themebook ? `Theme ${index + 1} (${themebook})` : `Theme ${index + 1}`;
}

/**
 * PRD 7.3: past the starting count the app warns in plain words and never
 * blocks. The sheet prints this sentence too, so it lives in one place.
 */
export function themeCountWarning(count: number): string | null {
  if (count <= STARTING_THEMES) return null;
  return `The character has ${count} themes, more than the ${STARTING_THEMES} it starts with.`;
}

/** One plain sentence per gap, in reading order. Empty means ready. */
export function readiness(character: Character): string[] {
  const { themes } = character;
  const gaps: string[] = [];

  themes.forEach((theme, index) => {
    if (!theme.powerTags.some((tag) => tag.id === theme.titleTagId)) {
      gaps.push(`${themeName(theme, index)} has no title tag.`);
    }
  });

  themes.forEach((theme, index) => {
    if (theme.weaknessTags.length === 0) {
      gaps.push(`${themeName(theme, index)} has no weakness tag.`);
    }
  });

  themes.forEach((theme, index) => {
    if (theme.quote.trim() === "") {
      gaps.push(`${themeName(theme, index)} has no ${LINE_NAME[theme.type]} line.`);
    }
  });

  if (character.essence === "") gaps.push("No Essence is chosen.");

  const { warning } = loadoutSpend(character.loadout);
  if (warning) gaps.push(warning);

  const count = themeCountWarning(themes.length);
  if (count) gaps.push(count);

  return gaps;
}
