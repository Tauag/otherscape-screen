"use client";

import { useId, useRef } from "react";
import { Chip } from "@/app/character/[id]/_components/chip";
import { DIALOG, HEADING, LABEL, QUIET } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { themeLine } from "@/lib/character/theme";
import type { Essence, GhostMemory } from "@/lib/character/types";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { ESSENCES, essenceSuggestion } from "@/lib/rules/essence-suggestion";

export function SheetMenu() {
  const menu = useRef<HTMLDialogElement>(null);
  const ghosts = useRef<HTMLDialogElement>(null);
  const essence = useRef<HTMLDialogElement>(null);
  const menuHeadingId = useId();
  const ghostsHeadingId = useId();
  const essenceHeadingId = useId();

  function open(target: React.RefObject<HTMLDialogElement | null>) {
    menu.current?.close();
    target.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => menu.current?.showModal()}
        aria-label="Sheet menu"
        className="-m-1 flex size-11 shrink-0 items-center justify-center p-1 text-dim"
      >
        <svg aria-hidden="true" width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="9" r="2" />
          <circle cx="2" cy="16" r="2" />
        </svg>
      </button>

      <dialog ref={menu} aria-labelledby={menuHeadingId} className={DIALOG}>
        <h2 id={menuHeadingId} className={HEADING}>
          Sheet menu
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" onClick={() => open(ghosts)} className={`${QUIET} justify-start`}>
            Ghost memories
          </button>
          <button type="button" onClick={() => open(essence)} className={`${QUIET} justify-start`}>
            Desired essence
          </button>
          <button
            type="button"
            onClick={() => menu.current?.close()}
            className={`${QUIET} mt-2 self-start`}
          >
            Close
          </button>
        </div>
      </dialog>

      <dialog
        ref={ghosts}
        aria-labelledby={ghostsHeadingId}
        className={`${DIALOG} max-h-[85vh] overflow-y-auto`}
      >
        <h2 id={ghostsHeadingId} className={HEADING}>
          Ghost memories
        </h2>
        <GhostMemories />
        <button
          type="button"
          onClick={() => ghosts.current?.close()}
          className={`${QUIET} mt-4 self-start`}
        >
          Close
        </button>
      </dialog>

      <dialog
        ref={essence}
        aria-labelledby={essenceHeadingId}
        className={`${DIALOG} max-h-[85vh] overflow-y-auto`}
      >
        <h2 id={essenceHeadingId} className={HEADING}>
          Desired essence
        </h2>
        <EssencePicker />
        <button
          type="button"
          onClick={() => essence.current?.close()}
          className={`${QUIET} mt-4 self-start`}
        >
          Done
        </button>
      </dialog>
    </>
  );
}

/** The player can still pick or override ahead of the auto-assignment,
 *  or fix a tied mix it can't resolve on its own (reducer.ts's `addTheme` case). */
function EssencePicker() {
  const { character, dispatch } = useCharacter();
  const { candidates, warning } = essenceSuggestion(character.themes, character.essence);
  const others = ESSENCES.filter((essence) => !candidates.includes(essence));

  const chip = (value: Essence) => (
    <label
      key={value}
      className={`inline-flex min-h-11 items-center gap-2 rounded-sm border px-3 font-display text-sm font-semibold tracking-[0.08em] uppercase ${
        character.essence === value ? "border-primary text-text" : "border-border text-dim"
      }`}
    >
      <input
        type="radio"
        name="essence"
        value={value}
        checked={character.essence === value}
        onChange={() => dispatch({ type: "setEssence", essence: value })}
        className="size-[18px] accent-primary"
      />
      {value}
    </label>
  );

  return (
    <div className="mt-4 flex flex-col gap-3">
      <fieldset>
        <legend className={LABEL}>Essence</legend>

        <div className="flex flex-col gap-2 pt-1">
          <p className="font-sans text-sm text-dim">
            {candidates.length === 0
              ? "Add a theme and the sheet suggests an Essence. Until then, choose one yourself."
              : candidates.length === 1
                ? "Your themes suggest this. It assigns itself once you hold 4 themes, unless you choose first."
                : "Your themes suggest one of these. The mix ties, so choose one yourself."}
          </p>

          {candidates.length > 0 && (
            <div className="flex flex-wrap gap-2">{candidates.map(chip)}</div>
          )}

          {warning && <p className="font-sans text-sm text-negative-text">{warning}</p>}

          <p className={LABEL}>{candidates.length > 0 ? "Other Essences" : "All Essences"}</p>
          <div className="flex flex-wrap gap-2">{others.map(chip)}</div>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className={LABEL}>Essence special</span>
        <textarea
          value={character.essenceSpecial}
          onChange={(event) =>
            dispatch({ type: "setEssenceSpecial", essenceSpecial: event.target.value })
          }
          className="min-h-11 rounded-sm border border-border bg-surface p-3 font-sans text-base field-sizing-content"
        />
      </label>
    </div>
  );
}

/** The archive players read back. Read-only, and never editable. */
function GhostMemories() {
  const { character } = useCharacter();

  if (character.ghostMemories.length === 0) {
    return <p className="mt-2 font-sans text-sm text-dim">No ghost memories yet.</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {character.ghostMemories.map((memory) => (
        <GhostEntry key={memory.id} memory={memory} />
      ))}
    </div>
  );
}

function GhostEntry({ memory }: { memory: GhostMemory }) {
  const { theme } = memory;
  const title = theme.powerTags.find((tag) => tag.id === theme.titleTagId);

  return (
    <article
      data-type={theme.type}
      className="flex flex-col gap-1 border-l-2 border-[var(--hue)] pl-2"
    >
      <span className={LABEL}>
        {theme.themebook.trim() || "No themebook"} · {theme.type}
      </span>
      <h3 className="font-display text-[17px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase">
        {title?.text.trim() || "Untitled theme"}
      </h3>
      <p className="font-sans text-[13px] text-dim">
        {/* lazy: the UTC date, because this client component renders on the
            server too and a locale-formatted time would not survive hydration.
            Ceiling: a theme lost late at night reads as the next day. Upgrade
            path: format it in an effect, once the browser has the page. */}
        Lost <time dateTime={memory.lostAt}>{memory.lostAt.slice(0, 10)}</time>.{" "}
        {memory.reason.trim() || "No reason was written down."}
      </p>

      <details>
        <summary className="min-h-11 cursor-pointer content-center font-mono text-[10px] tracking-[0.08em] text-dim uppercase">
          Read it back
        </summary>

        <ul className="flex flex-wrap gap-1.5">
          {theme.powerTags.map((tag) => (
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
          <p className="pt-1 font-sans text-[13px] text-dim">
            {themeLine(theme.type)}: {theme.quote}
          </p>
        )}

        {theme.specials.map((special, index) => (
          <p key={index} className="pt-1 font-sans text-[13px] text-dim">
            {special}
          </p>
        ))}

        <p className={`${LABEL} pt-1`}>
          {theme.nascent ? "Nascent · " : ""}
          Upgrade {theme.upgrade} of {UPGRADE_TRACK_LENGTH} · Decay {theme.decay} of{" "}
          {DECAY_TRACK_LENGTH}
        </p>
      </details>
    </article>
  );
}
