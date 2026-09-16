"use client";

import Link from "next/link";
import { use } from "react";
import { Chip } from "@/app/character/[id]/_components/chip";
import { DecayWarning } from "@/app/character/[id]/_components/decay-warning";
import { LoseTheme } from "@/app/character/[id]/_components/lose-theme";
import { Track } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { decayFull } from "@/lib/character/loss";
import { themeLine } from "@/lib/character/theme";
import type { Theme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";
import { STARTING_THEMES } from "@/lib/rules/constants";
import { themeCountWarning } from "@/lib/rules/readiness";
import { BackLink } from "@/components/back-link";

export default function SheetPage({ params }: PageProps<"/character/[id]">) {
  const { id } = use(params);
  const { character, dispatch } = useCharacter();
  const warning = themeCountWarning(character.themes.length);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-3">
      <BackLink href="/" text="Characters" />

      {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

      {character.themes.length === 0 ? (
        <p className="font-sans text-sm text-dim">This character has no themes yet.</p>
      ) : (
        character.themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} href={`/character/${id}/theme/${theme.id}`} />
        ))
      )}

      {character.themes.length < STARTING_THEMES && (
        <button
          type="button"
          onClick={() => dispatch({ type: "addTheme", id: crypto.randomUUID() })}
          className="inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
        >
          Add a theme
        </button>
      )}
    </main>
  );
}

function ThemeCard({ theme, href }: { theme: Theme; href: string }) {
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);
  const { nascent } = theme;

  return (
    <article
      data-type={theme.type}
      className={`flex overflow-hidden rounded-md border ${
        nascent ? "border-dashed border-raised bg-recess" : "border-border bg-surface"
      }`}
    >
      {/* Outside the body padding, so it runs the card's full height. */}
      <div
        aria-hidden="true"
        className={`w-[3px] shrink-0 ${nascent ? "bg-[var(--hue)]/35" : "bg-[var(--hue)]"}`}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={href}
            className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${
              nascent ? "text-muted" : "text-dim"
            }`}
          >
            {theme.type} · {theme.themebook.trim() || "No themebook"}
          </Link>

          {nascent ? (
            <span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
              NASCENT
            </span>
          ) : (
            <div className="flex items-center gap-4">
              <Track themeId={theme.id} track="upgrade" marked={theme.upgrade} size="sm" />
              <Track themeId={theme.id} track="decay" marked={theme.decay} size="sm" />
            </div>
          )}
        </div>

        <Link href={href} className="block">
          {title ? (
            <h2
              data-burnt={title.burnt ? "true" : undefined}
              className={`font-display text-[21px] leading-tight font-bold tracking-[0.045em] uppercase ${
                title.burnt ? "line-through" : ""
              } ${
                nascent
                  ? "text-[var(--hue-title)]/60"
                  : "text-[var(--hue-title)] [text-shadow:0_0_20px_color-mix(in_oklab,var(--hue)_38%,transparent)]"
              }`}
            >
              {title.text}
            </h2>
          ) : (
            <h2 className="min-h-11 content-center font-sans text-sm text-dim">No title tag yet.</h2>
          )}
        </Link>

        {/* The artboard draws a nascent card as the header and title alone. */}
        {!nascent && (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {theme.powerTags
                .filter((tag) => tag.id !== theme.titleTagId)
                .map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.letter}
                    text={tag.text}
                    burnt={tag.burnt}
                    burnValue={tag.burnValue}
                  />
                ))}

              {theme.weaknessTags.map((tag) => (
                <Chip key={tag.id} label={tag.letter} text={tag.text} negative />
              ))}
            </ul>

            {theme.quote.trim() && (
              <div className="flex items-baseline gap-[7px] pt-0.5">
                <span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
                  {themeLine(theme.type)}
                </span>
                <span className="font-sans text-[12.5px] text-quiet italic">{theme.quote}</span>
              </div>
            )}

            {/* The artboard predates the specials list, the decay warning, and
                the lose-theme button, so they run after the quote line. */}
            {theme.specials.length > 0 && (
              <ul className="flex flex-col gap-1">
                {theme.specials.map((special, index) => (
                  <li key={index} className="font-sans text-[13px] text-dim">
                    {specialName(special)}
                  </li>
                ))}
              </ul>
            )}

            {decayFull(theme) && (
              <>
                <DecayWarning />
                <LoseTheme themeId={theme.id} named={title?.text.trim() || "this theme"} />
              </>
            )}
          </>
        )}
      </div>
    </article>
  );
}
