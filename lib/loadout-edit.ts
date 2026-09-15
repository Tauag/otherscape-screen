import type { Loadout, LoadoutTag, MarkCount, Theme } from "./character/types.ts";

export type LoadoutGroups = {
  /** One per loadout theme, in loadout order. */
  groups: { theme: Theme; tags: LoadoutTag[] }[];
  /** Wildcards, misc flaws, and every tag whose theme is not in the loadout. */
  misc: LoadoutTag[];
};

/**
 * PRD 7.6: tag sets grouped per loadout theme, plus misc.
 *
 * A tag falls into misc when its theme has left the loadout, or is gone from the
 * character, rather than off the screen: loadoutSpend charges every tag in the
 * array, so a tag the player cannot see would still cost Power.
 */
export function groupLoadout(loadout: Loadout, themes: Theme[]): LoadoutGroups {
  const inLoadout = loadout.themeIds.flatMap((id) => themes.find((theme) => theme.id === id) ?? []);
  const ids = new Set(inLoadout.map((theme) => theme.id));

  return {
    groups: inLoadout.map((theme) => ({
      theme,
      tags: loadout.tags.filter((tag) => tag.themeId === theme.id),
    })),
    misc: loadout.tags.filter((tag) => tag.themeId === null || !ids.has(tag.themeId)),
  };
}

/**
 * In, or out. A theme moved out keeps its tags, themeId and all, so the set
 * comes back whole with the theme. Dropping them would throw away text the
 * player wrote, and the budget would still be charging for it.
 */
export function toggleLoadoutTheme(loadout: Loadout, themeId: string): Loadout {
  const inside = loadout.themeIds.includes(themeId);
  return {
    ...loadout,
    themeIds: inside
      ? loadout.themeIds.filter((id) => id !== themeId)
      : [...loadout.themeIds, themeId],
  };
}

/** Box `index` clicked: mark up to it, or unmark it and every box after it. */
export function markLoadoutUpgrade(marked: MarkCount, index: number): MarkCount {
  return (index < marked ? index : index + 1) as MarkCount;
}

export type UpgradeChoice = "power" | "special";

/** PRD 7.6: the full track clears, and the player takes one of the two. */
export function takeLoadoutUpgrade(loadout: Loadout, choice: UpgradeChoice): Loadout {
  return {
    ...loadout,
    upgrade: 0,
    availablePower: loadout.availablePower + (choice === "power" ? 1 : 0),
    // Empty, because the player writes the special in the textarea it adds.
    specials: choice === "special" ? [...loadout.specials, ""] : loadout.specials,
  };
}
