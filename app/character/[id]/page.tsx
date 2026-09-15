"use client";

import Link from "next/link";
import { useCharacter } from "@/app/character/[id]/provider";
import type { Theme } from "@/lib/character/types";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { themeCountWarning } from "@/lib/rules/readiness";
import { tagLabel } from "@/lib/tag-label";

const LABEL = "font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

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

// data-type sits here and nowhere else. Every chip below reads --hue, --hue-title
// and --hue-text off the cascade, so no chip has to learn its own theme type.
function ThemeCard({ theme }: { theme: Theme }) {
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);

  return (
    <article
      data-type={theme.type}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className={LABEL}>{theme.themebook.trim() || "No themebook"}</p>
        {theme.nascent && <p className={LABEL}>Nascent</p>}
      </div>

      {title ? (
        <h2 className="font-display text-[21px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
          {title.text}
        </h2>
      ) : (
        <h2 className="font-sans text-sm text-dim">No title tag yet.</h2>
      )}

      <ul className="flex flex-col gap-1.5">
        {/* The title tag is a power tag, and it is the heading above, so the
            list holds the rest. */}
        {theme.powerTags
          .filter((tag) => tag.id !== theme.titleTagId)
          .map((tag) => (
            <Chip
              key={tag.id}
              label={tagLabel(tag, "power")}
              text={tag.text}
              burnt={tag.burnt}
            />
          ))}

        {theme.weaknessTags.map((tag) => (
          <Chip key={tag.id} label={tagLabel(tag, "weakness")} text={tag.text} negative />
        ))}
      </ul>

      <div className="flex flex-wrap gap-x-4">
        <Track name="Upgrade" length={UPGRADE_TRACK_LENGTH} marked={theme.upgrade} />
        <Track name="Decay" length={DECAY_TRACK_LENGTH} marked={theme.decay} />
      </div>
    </article>
  );
}

function Chip({
  label,
  text,
  burnt,
  negative,
}: {
  label: string;
  text: string;
  burnt?: boolean;
  negative?: boolean;
}) {
  return (
    <li
      data-burnt={burnt ? "true" : undefined}
      data-valence={negative ? "negative" : undefined}
      className="flex min-h-11 items-center gap-2 border-l-2 border-[var(--hue)] pl-2"
    >
      <span className="font-mono text-[10px] text-[var(--hue)]">{label}</span>
      {/* Burnt reads as struck through as well as achromatic, so the state does
          not rest on colour alone. */}
      <span
        className={`font-display text-[15px] tracking-[0.03em] text-[var(--hue-text)] ${
          burnt ? "line-through" : ""
        }`}
      >
        {text}
      </span>
    </li>
  );
}

// lazy: display only. The boxes reflect the count and nothing more, because T27
// owns marking and clearing a track. Upgrade path: T27 adds the markUpgrade and
// markDecay verbs and drops `disabled`.
function Track({ name, length, marked }: { name: string; length: number; marked: number }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`${name} track`}>
      <p className={LABEL}>{name}</p>
      {Array.from({ length }, (_, index) => (
        <label key={index} className="grid size-11 place-items-center">
          <input
            type="checkbox"
            checked={index < marked}
            disabled
            className="size-[18px] accent-[var(--hue)]"
          />
          <span className="sr-only">{`${name} ${index + 1} of ${length}`}</span>
        </label>
      ))}
    </div>
  );
}
