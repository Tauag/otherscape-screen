// What the themebook, question, and specials pickers read out of a content pack.
// No React here, so node --test can run it.

import { POWER_LETTERS, WEAKNESS_LETTERS } from "./character/theme.ts";
import { findThemebook, type ContentPack, type Question, type Special } from "./content/pack.ts";

const blank = <L,>(letters: readonly L[]): Question<L>[] =>
  letters.map((letter) => ({ letter, text: "" }));

/**
 * The full A to J range, always. sysdesign 2 never retires a question, and a
 * homebrew themebook the pack cannot resolve still answers ten of them.
 */
export const powerQuestions = (pack: ContentPack, themebook: string) =>
  findThemebook(pack, themebook)?.powerQuestions ?? blank(POWER_LETTERS);

/** The full A to D range, on the same terms. */
export const weaknessQuestions = (pack: ContentPack, themebook: string) =>
  findThemebook(pack, themebook)?.weaknessQuestions ?? blank(WEAKNESS_LETTERS);

/** Five for a themebook the pack holds, none for a homebrew one. */
export const specialsOf = (pack: ContentPack, themebook: string): Special[] =>
  findThemebook(pack, themebook)?.specials ?? [];

/**
 * How many tags already answer each letter. It labels a row and never removes
 * one, because a question is never consumed. Counted across the theme rather
 * than the themebook: a borrowed answer is still an answer given here.
 */
export function answerCounts(tags: readonly { letter: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tag of tags) counts[tag.letter] = (counts[tag.letter] ?? 0) + 1;
  return counts;
}

/** `Theme.specials` is free text, and this is the shape it holds. */
export const SPECIAL_SEPARATOR = " — ";

/** Half a special is still worth storing, so an empty half drops out. */
export const formatSpecial = ({ name, text }: Special): string =>
  [name.trim(), text.trim()].filter(Boolean).join(SPECIAL_SEPARATOR);

/** The name half of a stored special, for the theme card, which has no room for the rule. */
export const specialName = (stored: string): string =>
  stored.split(SPECIAL_SEPARATOR)[0].trim();
