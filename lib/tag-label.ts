import type { PowerQuestionLetter, WeaknessQuestionLetter } from "./character/types.ts";

/**
 * design.md 3: every tag shows the themebook question it answers, and a
 * weakness letter wears a `w` so `B` and `wB` never read alike. A question may
 * be answered twice, so the label is a label and never a key.
 */
export function tagLabel(
  tag: { letter: PowerQuestionLetter | WeaknessQuestionLetter },
  kind: "power" | "weakness",
): string {
  return kind === "weakness" ? `w${tag.letter}` : tag.letter;
}
