"use client";

import { Button } from "@base-ui/react/button";
import { use } from "react";
import { QUIET } from "@/app/character/[id]/_components/styles";
import { ThemeCard } from "@/app/character/[id]/_components/theme-card";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { STARTING_THEMES } from "@/lib/rules/constants";
import { essenceSuggestion } from "@/lib/rules/essence-suggestion";
import { themeCountWarning } from "@/lib/rules/readiness";
import { BackLink } from "@/components/back-link";

export default function SheetPage({ params }: PageProps<"/character/[id]">) {
  const { id } = use(params);
  const { character, dispatch } = useCharacter();
  const warning = themeCountWarning(character.themes.length);
  const { candidates: essenceCandidates, state: essenceState } = essenceSuggestion(
    character.themes,
    character.essence,
  );
  const essenceTied = essenceState === "unchosen" && essenceCandidates.length > 1;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3 pb-8">
      <BackLink href="/" text="Characters" />

      {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

      {essenceTied && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3">
          <p className="font-sans text-sm text-dim">
            Your themes tie between {essenceCandidates[0]} and {essenceCandidates[1]}. Pick one.
          </p>
          <div className="flex gap-2">
            {essenceCandidates.map((essence) => (
              <Button
                key={essence}
                type="button"
                onClick={() => dispatch({ type: "setEssence", essence })}
                className={QUIET}
              >
                {essence}
              </Button>
            ))}
          </div>
        </div>
      )}

      {character.themes.length === 0 ? (
        <p className="font-sans text-sm text-dim">This character has no themes yet.</p>
      ) : (
        character.themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} href={`/character/${id}/theme/${theme.id}`} />
        ))
      )}

      {character.themes.length < STARTING_THEMES && (
        <Button
          type="button"
          onClick={() => dispatch({ type: "addTheme", id: crypto.randomUUID() })}
          className="inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
        >
          New theme
        </Button>
      )}
    </main>
  );
}
