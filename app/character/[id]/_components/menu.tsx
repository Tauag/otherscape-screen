"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import { Chip } from "@/app/character/[id]/_components/chip";
import { DIALOG_BACKDROP, DIALOG_POPUP, HEADING, LABEL, QUIET } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { themeLine } from "@/lib/character/theme";
import type { Essence, GhostMemory } from "@/lib/character/types";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { ESSENCES, essenceSuggestion } from "@/lib/rules/essence-suggestion";

const MENU_POPUP =
  "min-w-[190px] rounded-md border border-border bg-surface p-1 text-text shadow-lg outline-none";
const MENU_ITEM =
  "flex min-h-11 cursor-pointer items-center rounded-sm px-3 font-display text-sm font-semibold tracking-[0.08em] uppercase outline-none select-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary";

export function SheetMenu() {
  const [ghostsOpen, setGhostsOpen] = useState(false);
  const [essenceOpen, setEssenceOpen] = useState(false);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          aria-label="Sheet menu"
          className="-m-1 flex size-11 shrink-0 items-center justify-center p-1 text-dim"
        >
          <svg aria-hidden="true" width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="9" r="2" />
            <circle cx="2" cy="16" r="2" />
          </svg>
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={8} className="outline-none">
            <Menu.Popup className={MENU_POPUP}>
              <Menu.Item className={MENU_ITEM} onClick={() => setGhostsOpen(true)}>
                Ghost memories
              </Menu.Item>
              <Menu.Item className={MENU_ITEM} onClick={() => setEssenceOpen(true)}>
                Desired essence
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <Dialog.Root open={ghostsOpen} onOpenChange={setGhostsOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className={DIALOG_BACKDROP} />
          <Dialog.Popup className={`${DIALOG_POPUP} max-h-[85vh] overflow-y-auto`}>
            <Dialog.Title className={HEADING}>Ghost memories</Dialog.Title>
            <GhostMemories />
            <Dialog.Close className={`${QUIET} mt-4 self-start`}>Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={essenceOpen} onOpenChange={setEssenceOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className={DIALOG_BACKDROP} />
          <Dialog.Popup className={`${DIALOG_POPUP} max-h-[85vh] overflow-y-auto`}>
            <Dialog.Title className={HEADING}>Desired essence</Dialog.Title>
            <EssencePicker />
            <Dialog.Close className={`${QUIET} mt-4 self-start`}>Done</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
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
