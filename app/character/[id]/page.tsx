"use client";

import Link from "next/link";
import { useCharacter } from "@/app/character/[id]/provider";
import { themeCountWarning } from "@/lib/rules/readiness";
import { LABEL } from "./sheet/label";
import { ThemeCard } from "./sheet/theme-card";

export default function SheetPage() {
  const { character, dispatch } = useCharacter();
  const warning = themeCountWarning(character.themes.length);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-6">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
      >
        <span aria-hidden>←</span>
        Characters
      </Link>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Name</span>
        <input
          value={character.name}
          onChange={(event) => dispatch({ type: "rename", name: event.target.value })}
          className="min-h-11 rounded-sm border border-border bg-surface px-3 font-display text-[21px] font-bold tracking-[0.05em] uppercase"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Played by</span>
        <input
          value={character.playerName}
          onChange={(event) =>
            dispatch({ type: "setPlayerName", playerName: event.target.value })
          }
          className="min-h-11 rounded-sm border border-border bg-surface px-3 font-sans text-base"
        />
      </label>

      {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

      {character.themes.length === 0 ? (
        <p className="font-sans text-sm text-dim">This character has no themes yet.</p>
      ) : (
        character.themes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)
      )}
    </main>
  );
}
