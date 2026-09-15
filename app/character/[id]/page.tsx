"use client";

import Link from "next/link";
import { useCharacter } from "@/app/character/[id]/provider";

// lazy: a placeholder. It exists to prove the state provider and autosave from
// the screen, so it holds the two fields the reducer has verbs for. S4 replaces
// it with the real sheet: theme cards, both tracks, and the tab bar.
export default function SheetPage() {
  const { character, dispatch } = useCharacter();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
      >
        <span aria-hidden>←</span>
        Characters
      </Link>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[0.08em] text-faint uppercase">Name</span>
        <input
          value={character.name}
          onChange={(event) => dispatch({ type: "rename", name: event.target.value })}
          className="min-h-11 rounded-sm border border-border bg-surface px-3 font-display text-[21px] font-bold tracking-[0.05em] uppercase"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[0.08em] text-faint uppercase">
          Played by
        </span>
        <input
          value={character.playerName}
          onChange={(event) =>
            dispatch({ type: "setPlayerName", playerName: event.target.value })
          }
          className="min-h-11 rounded-sm border border-border bg-surface px-3 font-sans text-base"
        />
      </label>
    </main>
  );
}
