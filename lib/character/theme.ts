import type {
  PowerQuestionLetter,
  PowerTag,
  Theme,
  ThemeType,
  WeaknessQuestionLetter,
  WeaknessTag,
} from "./types.ts";

/**
 * PRD 6: one quote line, named by theme type. Checked against the content pack:
 * all 14 themebooks carry `motivation.label`, and it is Identity on every Self
 * book, Ritual on every Mythos book, and Itch on every Noise book. The label
 * therefore follows the type and never needs the themebook.
 */
const LINE_NAME: Record<ThemeType, string> = {
  self: "Identity",
  mythos: "Ritual",
  noise: "Itch",
};

export function themeLine(type: ThemeType): string {
  return LINE_NAME[type];
}

/**
 * The full range, always. sysdesign 2: a question may be answered again at any
 * time, so no screen removes a letter that already carries a tag.
 */
export const POWER_LETTERS: PowerQuestionLetter[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
];

export const WEAKNESS_LETTERS: WeaknessQuestionLetter[] = ["A", "B", "C", "D"];

export type TagKind = "power" | "weakness";

export type MoveDirection = "up" | "down";

/** The id comes from the caller, because a reducer has to stay pure. */
export function addPowerTag(theme: Theme, id: string, letter: PowerQuestionLetter): Theme {
  const tag: PowerTag = { id, themebook: theme.themebook, letter, text: "", burnt: false };
  return {
    ...theme,
    powerTags: [...theme.powerTags, tag],
    // types.ts: the title is null until question A is answered, so the first
    // answer to A takes the title a themeless card is missing.
    titleTagId: theme.titleTagId ?? (letter === "A" ? id : null),
  };
}

export function addWeaknessTag(theme: Theme, id: string, letter: WeaknessQuestionLetter): Theme {
  return { ...theme, weaknessTags: [...theme.weaknessTags, { id, letter, text: "" }] };
}

export function editPowerTag(
  theme: Theme,
  tagId: string,
  edit: Partial<Pick<PowerTag, "themebook" | "letter" | "text">>,
): Theme {
  return {
    ...theme,
    powerTags: theme.powerTags.map((tag) => (tag.id === tagId ? { ...tag, ...edit } : tag)),
  };
}

export function editWeaknessTag(
  theme: Theme,
  tagId: string,
  edit: Partial<Pick<WeaknessTag, "letter" | "text">>,
): Theme {
  return {
    ...theme,
    weaknessTags: theme.weaknessTags.map((tag) => (tag.id === tagId ? { ...tag, ...edit } : tag)),
  };
}

export function deletePowerTag(theme: Theme, tagId: string): Theme {
  return {
    ...theme,
    powerTags: theme.powerTags.filter((tag) => tag.id !== tagId),
    // Deleting the title leaves the theme titleless rather than promoting a tag
    // the player did not choose. readiness() then says the title is missing.
    titleTagId: theme.titleTagId === tagId ? null : theme.titleTagId,
  };
}

export function deleteWeaknessTag(theme: Theme, tagId: string): Theme {
  return { ...theme, weaknessTags: theme.weaknessTags.filter((tag) => tag.id !== tagId) };
}

function swapped<T extends { id: string }>(tags: T[], tagId: string, direction: MoveDirection): T[] {
  const from = tags.findIndex((tag) => tag.id === tagId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= tags.length) return tags;

  const next = [...tags];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * lazy: move-up and move-down, no drag-and-drop (sysdesign 10). The ceiling is a
 * theme with many tags, where dragging would be quicker. The upgrade path is
 * `dnd-kit` on the tag list alone.
 */
export function moveTag(
  theme: Theme,
  kind: TagKind,
  tagId: string,
  direction: MoveDirection,
): Theme {
  return kind === "power"
    ? { ...theme, powerTags: swapped(theme.powerTags, tagId, direction) }
    : { ...theme, weaknessTags: swapped(theme.weaknessTags, tagId, direction) };
}
