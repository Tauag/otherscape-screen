import type { Essence, Theme } from "../character/types.ts";

/** Keyed by the distinct theme types present, sorted and joined. */
const BY_MIX: Record<string, Essence[]> = {
  self: ["Real"],
  mythos: ["Avatar", "Conduit"],
  noise: ["Singularity"],
  "mythos+self": ["Spiritualist"],
  "noise+self": ["Cyborg"],
  "mythos+noise": ["Transhuman"],
  "mythos+noise+self": ["Nexus"],
};

/** The Essences the mix allows. Mythos alone allows two, so the player chooses. */
export function essenceCandidates(themes: Pick<Theme, "type">[]): Essence[] {
  const mix = [...new Set(themes.map((theme) => theme.type))].sort().join("+");
  return BY_MIX[mix] ?? [];
}
