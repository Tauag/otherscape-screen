import { DECAY_TRACK_LENGTH } from "../rules/constants.ts";
import type { Character, GhostMemory, Theme } from "./types.ts";

/** PRD 7.4: a full track is the warning. Losing the theme stays a player action. */
export function decayFull(theme: Theme): boolean {
  return theme.decay >= DECAY_TRACK_LENGTH;
}

/**
 * PRD 7.4: one action, and it never reads the Decay track. The caller mints the
 * ghost memory's id and timestamp, because a reducer runs twice in development
 * and has to return the same document both times.
 *
 * lazy: the theme screen and a full Decay track are the only callers so far.
 * Ceiling: none, the verb takes any reason. Upgrade path: Going Out In A Blaze,
 * an Avatar defying their Agenda, a Conduit replacing a theme at will, and the
 * theme specials each call this with their own reason.
 */
export function loseTheme(
  character: Character,
  themeId: string,
  memory: Omit<GhostMemory, "theme">,
): Character {
  const lost = character.themes.find((theme) => theme.id === themeId);
  if (!lost) return character;

  return {
    ...character,
    themes: character.themes.filter((theme) => theme.id !== themeId),
    // The theme object itself, because PRD 6 reads the snapshot back whole.
    ghostMemories: [...character.ghostMemories, { ...memory, theme: lost }],
    loadout: {
      ...character.loadout,
      // An id alone, pointing at a theme that cannot come back, so it goes. The
      // loadout tags stay: they hold text the player wrote, and groupLoadout
      // already shows a tag whose theme is gone under misc, where it can be read
      // and deleted. A charge the player can see is honest.
      themeIds: character.loadout.themeIds.filter((id) => id !== themeId),
    },
  };
}
