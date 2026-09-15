"use client";

import Link from "next/link";
import { use } from "react";
import { LABEL, Track } from "@/app/character/[id]/parts";
import { useCharacter } from "@/app/character/[id]/provider";
import {
  POWER_LETTERS,
  themeLine,
  WEAKNESS_LETTERS,
  type MoveDirection,
  type TagKind,
} from "@/lib/character/theme";
import type {
  PowerQuestionLetter,
  ThemeType,
  WeaknessQuestionLetter,
} from "@/lib/character/types";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { tagLabel } from "@/lib/tag-label";

const THEME_TYPES: ThemeType[] = ["self", "mythos", "noise"];

const FIELD = "min-h-11 rounded-sm border border-border bg-bg px-3 font-sans text-base";
const ICON =
  "grid size-11 shrink-0 place-items-center rounded-sm border border-border text-base disabled:opacity-30";
const ADD =
  "inline-flex min-h-11 items-center self-start rounded-sm border border-[var(--hue)] px-4 font-display text-sm font-semibold tracking-[0.08em] text-[var(--hue)] uppercase";

// data-type sits on <main> and nowhere else, so every tag row below reads --hue,
// --hue-title and --hue-text off the cascade instead of learning its own type.
export default function ThemePage({ params }: PageProps<"/character/[id]/theme/[tid]">) {
  const { id, tid } = use(params);
  const { character, dispatch } = useCharacter();

  const theme = character.themes.find((candidate) => candidate.id === tid);
  const back = `/character/${id}`;

  // A theme can go while this screen is open: T34 loses one, and another device
  // can lose it too. That is a missing theme, not a missing page.
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
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6"
    >
      <Link
        href={back}
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
      >
        <span aria-hidden>←</span>
        Sheet
      </Link>

      <h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
        {title?.text.trim() || "Untitled theme"}
      </h1>

      <fieldset className="flex flex-col gap-1">
        <legend className={LABEL}>Theme type</legend>
        <div className="flex gap-1">
          {THEME_TYPES.map((value) => (
            // Each segment carries its own data-type, so the three options paint
            // in the three hues they stand for.
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

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Themebook</span>
        {/* lazy: typed in, so a homebrew themebook works today. Ceiling: no
            concepts and no questions to read. Upgrade path: T28's picker route. */}
        <input
          type="text"
          value={theme.themebook}
          onChange={(event) =>
            dispatch({ type: "setThemebook", themeId: theme.id, themebook: event.target.value })
          }
          placeholder="Troubled Past"
          className={FIELD}
        />
      </label>

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
              index={index}
              count={theme.powerTags.length}
              isTitle={tag.id === theme.titleTagId}
              themeThemebook={theme.themebook}
            />
          ))}
        </ul>
        {/* lazy: a new tag starts on question A and the player changes it, since
            nothing here knows the questions. Upgrade path: T29's picker route. */}
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
        {/* lazy: read-only. Ceiling: a special can only arrive from elsewhere.
            Upgrade path: T30's picker route lists the themebook's five. */}
        {theme.specials.length === 0 ? (
          <p className="font-sans text-sm text-dim">No theme specials yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {/* The index keys: this list is read-only, so nothing reorders. */}
            {theme.specials.map((special, index) => (
              <li key={index} className="font-sans text-sm">
                {special}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-x-4 pb-2">
        <Track name="Upgrade" length={UPGRADE_TRACK_LENGTH} marked={theme.upgrade} />
        <Track name="Decay" length={DECAY_TRACK_LENGTH} marked={theme.decay} />
      </div>
    </main>
  );
}

type RowTag = {
  id: string;
  letter: PowerQuestionLetter | WeaknessQuestionLetter;
  text: string;
  themebook?: string;
  burnt?: boolean;
};

function TagRow({
  kind,
  themeId,
  tag,
  index,
  count,
  isTitle,
  themeThemebook,
}: {
  kind: TagKind;
  themeId: string;
  tag: RowTag;
  index: number;
  count: number;
  /** Power tags only: this tag is the one drawn as the theme's title. */
  isTitle?: boolean;
  /** Power tags only: the themebook a tag falls back to when it borrows none. */
  themeThemebook?: string;
}) {
  const { dispatch } = useCharacter();

  const label = tagLabel(tag, kind);
  const named = tag.text.trim() || `the blank ${label} tag`;
  const power = kind === "power";
  const letters: string[] = power ? POWER_LETTERS : WEAKNESS_LETTERS;

  // The letter comes back off the DOM as a string. Looking it up in the list the
  // options were drawn from narrows it without a cast, and drops anything else.
  function chooseLetter(value: string) {
    if (power) {
      const letter = POWER_LETTERS.find((candidate) => candidate === value);
      if (letter) dispatch({ type: "editPowerTag", themeId, tagId: tag.id, edit: { letter } });
      return;
    }
    const letter = WEAKNESS_LETTERS.find((candidate) => candidate === value);
    if (letter) dispatch({ type: "editWeaknessTag", themeId, tagId: tag.id, edit: { letter } });
  }

  function setText(text: string) {
    dispatch(
      power
        ? { type: "editPowerTag", themeId, tagId: tag.id, edit: { text } }
        : { type: "editWeaknessTag", themeId, tagId: tag.id, edit: { text } },
    );
  }

  function move(event: React.MouseEvent<HTMLButtonElement>, direction: MoveDirection) {
    const to = direction === "up" ? index - 1 : index + 1;
    // The pressed button disables once the tag lands at an end, and focus on a
    // disabled button is focus lost. Hand it to the twin beside it first. The
    // two buttons are adjacent siblings below, which is what this reads.
    if (to === 0 || to === count - 1) {
      const twin =
        direction === "up"
          ? event.currentTarget.nextElementSibling
          : event.currentTarget.previousElementSibling;
      if (twin instanceof HTMLElement) twin.focus();
    }
    dispatch({ type: "moveTag", themeId, kind, tagId: tag.id, direction });
  }

  return (
    <li
      data-burnt={tag.burnt ? "true" : undefined}
      data-valence={power ? undefined : "negative"}
      className="flex flex-col gap-1.5 border-l-2 border-[var(--hue)] pl-2"
    >
      <div className="flex items-center gap-2">
        {/* lazy: a plain list of every letter, answered or not, because sysdesign
            2 never retires a question. Ceiling: no question text to read.
            Upgrade path: T29's picker route. */}
        <select
          value={tag.letter}
          onChange={(event) => chooseLetter(event.target.value)}
          aria-label={`Question letter for ${named}`}
          className="min-h-11 rounded-sm border border-border bg-bg px-2 font-mono text-[13px] text-[var(--hue)]"
        >
          {letters.map((letter) => (
            <option key={letter} value={letter}>
              {power ? letter : `w${letter}`}
            </option>
          ))}
        </select>

        {/* Burnt reads as struck through as well as achromatic, so the state does
            not rest on colour alone. T26 owns the control that sets it. */}
        <input
          type="text"
          value={tag.text}
          onChange={(event) => setText(event.target.value)}
          aria-label={`${power ? "Power" : "Weakness"} tag ${label}`}
          placeholder="Answer the question"
          className={`min-h-11 min-w-32 flex-1 rounded-sm border border-border bg-bg px-3 font-display text-[15px] tracking-[0.03em] text-[var(--hue-text)] ${
            tag.burnt ? "line-through" : ""
          }`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {power && (
          <input
            type="text"
            value={tag.themebook ?? ""}
            onChange={(event) =>
              dispatch({
                type: "editPowerTag",
                themeId,
                tagId: tag.id,
                edit: { themebook: event.target.value },
              })
            }
            placeholder={themeThemebook}
            aria-label={`Themebook ${named} answers`}
            className="min-h-11 min-w-32 flex-1 rounded-sm border border-border bg-bg px-3 font-sans text-[13px] text-dim"
          />
        )}

        {power && (
          <label className="flex min-h-11 items-center gap-1.5 px-1.5">
            <input
              type="radio"
              name="title-tag"
              checked={isTitle ?? false}
              onChange={() => dispatch({ type: "setTitleTag", themeId, tagId: tag.id })}
              className="size-[18px] accent-[var(--hue)]"
            />
            <span className={LABEL}>Title</span>
          </label>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={(event) => move(event, "up")}
            aria-label={`Move ${named} up`}
            className={ICON}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === count - 1}
            onClick={(event) => move(event, "down")}
            aria-label={`Move ${named} down`}
            className={ICON}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                power
                  ? { type: "deletePowerTag", themeId, tagId: tag.id }
                  : { type: "deleteWeaknessTag", themeId, tagId: tag.id },
              )
            }
            aria-label={`Delete ${named}`}
            className={ICON}
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}
