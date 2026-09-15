"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { DecayWarning, LABEL, LoseTheme, Track } from "@/app/character/[id]/_components/parts";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { decayFull } from "@/lib/character/loss";
import { themeLine } from "@/lib/character/theme";
import type { ThemeType } from "@/lib/character/types";
import { TagRow } from "./_components/tag-row";
import { BackLink } from "@/components/back-link";

const THEME_TYPES: ThemeType[] = ["self", "mythos", "noise"];

const FIELD = "min-h-11 rounded-sm border border-border bg-bg px-3 font-sans text-base";
const ADD =
  "inline-flex min-h-11 items-center self-start rounded-sm border border-[var(--hue)] px-4 font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase";

export default function ThemePage({ params }: PageProps<"/character/[id]/theme/[tid]">) {
  const { id, tid } = use(params);
  const { character, dispatch } = useCharacter();
  const router = useRouter();

  const theme = character.themes.find((candidate) => candidate.id === tid);
  const back = `/character/${id}`;
  /** This screen, and the root of the three picker routes that return to it. */
  const here = `${back}/theme/${tid}`;

  if (!theme) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-6">
        <p className="font-sans text-base text-dim">
          This character has no such theme. It may have been lost or replaced.
        </p>
        <Link
          href={back}
          className="inline-flex min-h-11 items-center self-start rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase"
        >
          Back to the sheet
        </Link>
      </main>
    );
  }

  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);

  return (
    <main
      data-type={theme.type}
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-3"
    >
      <BackLink href={back} text="Sheet" />

      <h1
        data-burnt={title?.burnt ? "true" : undefined}
        className={`font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase ${
          title?.burnt ? "line-through" : ""
        }`}
      >
        {title?.text.trim() || "Untitled theme"}
      </h1>

      <fieldset className="flex flex-col gap-1">
        <legend className={LABEL}>Theme type</legend>
        <div className="flex gap-1">
          {THEME_TYPES.map((value) => (
            <label key={value} data-type={value} className="flex-1">
              <input
                type="radio"
                name="theme-type"
                value={value}
                checked={theme.type === value}
                onChange={() =>
                  dispatch({ type: "setThemeType", themeId: theme.id, themeType: value })
                }
                className="peer sr-only"
              />
              <span className="grid min-h-11 place-items-center rounded-sm border border-border font-display text-sm font-semibold tracking-[0.08em] text-dim uppercase peer-checked:border-[var(--hue)] peer-checked:text-[var(--hue)] peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                {value}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <span className={LABEL}>Themebook</span>
        <Link
          href={`${here}/themebook`}
          aria-label={`Themebook: ${theme.themebook.trim() || "none yet"}`}
          className={`${FIELD} flex items-center`}
        >
          <span className={theme.themebook.trim() ? undefined : "text-dim"}>
            {theme.themebook.trim() || "Choose a themebook"}
          </span>
        </Link>
      </div>

      <label className="flex min-h-11 items-center gap-2">
        <input
          type="checkbox"
          checked={theme.nascent}
          onChange={(event) =>
            dispatch({ type: "setNascent", themeId: theme.id, nascent: event.target.checked })
          }
          className="size-[18px] accent-[var(--hue)]"
        />
        <span className="font-sans text-base">Nascent</span>
      </label>

      <section className="flex flex-col gap-2">
        <h2 className={LABEL}>Power tags</h2>
        <ul className="flex flex-col gap-3">
          {theme.powerTags.map((tag, index) => (
            <TagRow
              key={tag.id}
              kind="power"
              themeId={theme.id}
              tag={tag}
              href={`${here}/tag/${tag.id}`}
              index={index}
              count={theme.powerTags.length}
              isTitle={tag.id === theme.titleTagId}
              themeThemebook={theme.themebook}
            />
          ))}
        </ul>
        {/* A new tag starts on question A. Its letter is the way in to the
            question picker, where the player reads the ten and chooses. */}
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "addPowerTag",
              themeId: theme.id,
              id: crypto.randomUUID(),
              letter: "A",
            })
          }
          className={ADD}
        >
          Add power tag
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className={LABEL}>Weakness tags</h2>
        <ul className="flex flex-col gap-3">
          {theme.weaknessTags.map((tag, index) => (
            <TagRow
              key={tag.id}
              kind="weakness"
              themeId={theme.id}
              tag={tag}
              href={`${here}/tag/${tag.id}`}
              index={index}
              count={theme.weaknessTags.length}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "addWeaknessTag",
              themeId: theme.id,
              id: crypto.randomUUID(),
              letter: "A",
            })
          }
          className={ADD}
        >
          Add weakness tag
        </button>
      </section>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>{themeLine(theme.type)}</span>
        <input
          type="text"
          value={theme.quote}
          onChange={(event) =>
            dispatch({ type: "setThemeQuote", themeId: theme.id, quote: event.target.value })
          }
          placeholder={`One line of ${themeLine(theme.type)}`}
          className={FIELD}
        />
      </label>

      <section className="flex flex-col gap-1.5">
        <h2 className={LABEL}>Theme specials</h2>
        {theme.specials.length === 0 ? (
          <p className="font-sans text-sm text-dim">No theme specials yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {/* The index keys: the picker takes a special or gives it back whole,
                and nothing reorders the list. */}
            {theme.specials.map((special, index) => (
              <li key={index} className="font-sans text-sm">
                {special}
              </li>
            ))}
          </ul>
        )}
        <Link href={`${here}/specials`} className={`${ADD} mt-1`}>
          Choose theme specials
        </Link>
      </section>

      <div className="flex gap-[10px]">
        <Track themeId={theme.id} track="upgrade" marked={theme.upgrade} size="lg" />
        <Track themeId={theme.id} track="decay" marked={theme.decay} size="lg" />
      </div>

      {/* Losing a theme is offered here whatever the Decay track says (PRD 7.4).
          replace, not push: back would land on a route whose theme is gone. */}
      <section className="flex flex-col gap-2 pb-2">
        {decayFull(theme) && <DecayWarning />}
        <LoseTheme
          themeId={theme.id}
          named={title?.text.trim() || "this theme"}
          onLost={() => router.replace(back)}
        />
      </section>
    </main>
  );
}
