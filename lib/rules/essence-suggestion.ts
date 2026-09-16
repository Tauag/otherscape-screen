import type { Essence, Theme } from "../character/types.ts";
import { essenceCandidates } from "./essence.ts";

/** Every Essence, in the order the sheet offers them, so an override can reach all eight. */
export const ESSENCES: Essence[] = [
  "Real",
  "Avatar",
  "Conduit",
  "Singularity",
  "Spiritualist",
  "Cyborg",
  "Transhuman",
  "Nexus",
];

/**
 * - `unchosen`: no Essence yet. The player can end this state at any time; so
 *   can the reducer, once the mix narrows to one Essence and 4 themes exist.
 * - `suggested`: the choice is one the mix suggests.
 * - `override`: the mix suggests nothing, so the choice stands unopposed.
 * - `mismatch`: the mix changed under a choice it no longer suggests.
 */
export type EssenceState = "unchosen" | "suggested" | "override" | "mismatch";

export type EssenceSuggestion = {
  candidates: Essence[];
  /** The player's confirmed Essence, reported back in every state. */
  chosen: Essence | "";
  state: EssenceState;
  /** design.md decision 3: a warning is a sentence and never blocks. */
  warning: string | null;
};

const or = new Intl.ListFormat("en", { type: "disjunction" });

/**
 * Derived on every render and never stored, because a suggestion is not a
 * choice: the app reads `chosen` and never writes it.
 */
export function essenceSuggestion(
  themes: Pick<Theme, "type">[],
  chosen: Essence | "",
): EssenceSuggestion {
  const candidates = essenceCandidates(themes);
  const base = { candidates, chosen, warning: null };

  if (chosen === "") return { ...base, state: "unchosen" };
  if (candidates.includes(chosen)) return { ...base, state: "suggested" };
  // No themes, or a mix the table does not name: nothing to contradict the choice.
  if (candidates.length === 0) return { ...base, state: "override" };

  return {
    ...base,
    state: "mismatch",
    warning: `The theme mix now suggests ${or.format(candidates)}. ${chosen} stays chosen until you change it.`,
  };
}
