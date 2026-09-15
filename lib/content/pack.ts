import type { PowerQuestionLetter, ThemeType, WeaknessQuestionLetter } from "../character/types.ts";
import {
  FALLBACK_THEMEBOOKS,
  POWER_LETTERS,
  SPECIALS_PER_THEMEBOOK,
  WEAKNESS_LETTERS,
} from "./fallback.ts";

export type Question<L> = { letter: L; text: string };

export type Special = { name: string; text: string };

export type Themebook = {
  id: string;
  name: string;
  type: ThemeType;
  summary: string;
  concept: string;
  /** Always the ten letters, in order. */
  powerQuestions: Question<PowerQuestionLetter>[];
  /** Always the four letters, in order. */
  weaknessQuestions: Question<WeaknessQuestionLetter>[];
  /** Always five. */
  specials: Special[];
};

export type ContentPack = { themebooks: Themebook[] };

/** What a tag editor prints over a blank field: "power tag question B". */
export const questionLabel = (kind: "power" | "weakness", letter: string) =>
  `${kind} tag question ${letter}`;

export const themebooksOfType = (pack: ContentPack, type: ThemeType) =>
  pack.themebooks.filter((book) => book.type === type);

/** A theme stores its themebook as free text, so a name matches as well as an id. */
export const findThemebook = (pack: ContentPack, idOrName: string) =>
  pack.themebooks.find(
    (book) =>
      book.id === idOrName || book.name.toLowerCase() === idOrName.trim().toLowerCase(),
  ) ?? null;

const empty = <L,>(letters: readonly L[]): Question<L>[] =>
  letters.map((letter) => ({ letter, text: "" }));

export const FALLBACK_PACK: ContentPack = {
  themebooks: FALLBACK_THEMEBOOKS.map((book) => ({
    ...book,
    summary: "",
    concept: "",
    powerQuestions: empty(POWER_LETTERS),
    weaknessQuestions: empty(WEAKNESS_LETTERS),
    specials: Array.from({ length: SPECIALS_PER_THEMEBOOK }, () => ({ name: "", text: "" })),
  })),
};

/**
 * `themebooks.json` as the row holds it, normalized. Returns null on any shape
 * the pickers could not render, because a half-read pack is worse than the
 * fallback: the caller substitutes FALLBACK_PACK and every screen still works.
 */
export function normalize(raw: unknown): ContentPack | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { themebooks } = raw as Record<string, unknown>;
  if (!Array.isArray(themebooks) || themebooks.length === 0) return null;

  const normalized: Themebook[] = [];
  for (const entry of themebooks) {
    const book = normalizeThemebook(entry);
    if (!book) return null;
    normalized.push(book);
  }
  return { themebooks: normalized };
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

const isThemeType = (value: string): value is ThemeType =>
  value === "self" || value === "mythos" || value === "noise";

function normalizeThemebook(raw: unknown): Themebook | null {
  if (typeof raw !== "object" || raw === null) return null;
  const book = raw as Record<string, unknown>;

  // The pack capitalizes the type; ThemeType and the CSS `data-type` values are lowercase.
  const type = text(book.type).toLowerCase();
  if (typeof book.id !== "string" || typeof book.name !== "string" || !isThemeType(type)) return null;

  const powerQuestions = normalizeQuestions(POWER_LETTERS, book.power_tag_questions);
  const weaknessQuestions = normalizeQuestions(WEAKNESS_LETTERS, book.weakness_tag_questions);
  const { specials } = book;
  if (
    !powerQuestions ||
    !weaknessQuestions ||
    !Array.isArray(specials) ||
    specials.length !== SPECIALS_PER_THEMEBOOK
  ) {
    return null;
  }

  return {
    id: book.id,
    name: book.name,
    type,
    summary: text(book.summary),
    concept: text(book.concept),
    powerQuestions,
    weaknessQuestions,
    specials: specials.map((special) => {
      const { name, text: rule } = (special ?? {}) as Record<string, unknown>;
      return { name: text(name), text: text(rule) };
    }),
  };
}

function normalizeQuestions<L extends string>(
  letters: readonly L[],
  raw: unknown,
): Question<L>[] | null {
  if (typeof raw !== "object" || raw === null) return null;
  const byLetter = raw as Record<string, unknown>;
  const questions: Question<L>[] = [];
  for (const letter of letters) {
    if (typeof byLetter[letter] !== "string") return null;
    questions.push({ letter, text: byLetter[letter] });
  }
  return questions;
}

/**
 * One entry, holding the `updated_at` it was filled from. A refill replaces it,
 * so nothing accumulates. The entry keeps the row's own JSON rather than the
 * normalized pack, which leaves `normalize` the only reader of a pack shape: a
 * hand-edited entry is then rejected exactly like a bad row.
 */
export const PACK_CACHE_KEY = "otherscape:pack:themebooks";

/** Only what the cache needs, so a test can pass a plain object. */
export type PackStore = Pick<Storage, "getItem" | "setItem">;

/** The cached pack, or null when the row has been refilled since, or nothing is cached. */
export function readCachedPack(store: PackStore, updatedAt: string): ContentPack | null {
  try {
    const raw = store.getItem(PACK_CACHE_KEY);
    if (raw === null) return null;
    const entry: unknown = JSON.parse(raw);
    if (typeof entry !== "object" || entry === null) return null;
    const cached = entry as Record<string, unknown>;
    if (cached.updatedAt !== updatedAt) return null;
    return normalize(cached.pack);
  } catch {
    // Blocked site data, or an entry someone hand-edited. Refetching is correct.
    return null;
  }
}

/** `raw` is the row's `data` as it arrived, not the normalized pack. */
export function writeCachedPack(store: PackStore, updatedAt: string, raw: unknown): void {
  try {
    store.setItem(PACK_CACHE_KEY, JSON.stringify({ updatedAt, pack: raw }));
  } catch {
    // Private mode, or the quota is full. The pack is still in memory for this
    // page load; the next one pays for the fetch again.
  }
}
