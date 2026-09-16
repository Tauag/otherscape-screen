"use client";

import { useId, useRef, useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { DIALOG, HEADING, LABEL, PRIMARY, QUIET } from "@/app/character/[id]/_components/styles";

export function BurnButton({
  themeId,
  tagId,
  burnt,
  named,
}: {
  themeId: string;
  tagId: string;
  burnt: boolean;
  named: string;
}) {
  const { dispatch } = useCharacter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(String(DEFAULT_BURN_VALUE));
  const headingId = useId();

  function open() {
    setValue(String(DEFAULT_BURN_VALUE));
    dialog.current?.showModal();
  }

  function burn() {
    const parsed = Number.parseInt(value, 10);
    dispatch({
      type: "burnTag",
      themeId,
      tagId,
      burnValue: Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BURN_VALUE,
    });
  }

  if (burnt) {
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: "unburnTag", themeId, tagId })}
        aria-label={`Un-burn ${named}`}
        className={`${QUIET} px-3 text-[var(--hue)]`}
      >
        Un-burn
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={open} aria-label={`Burn ${named}`} className={`${QUIET} px-3`}>
        Burn
      </button>

      <dialog ref={dialog} aria-labelledby={headingId} className={DIALOG}>
        <h2 id={headingId} className={HEADING}>
          Burn {named}
        </h2>
        <p className="mt-2 font-sans text-sm text-dim">
          A burnt tag adds its value once, then reads as burnt until you un-burn it. Theme specials
          burn for 4 or 5.
        </p>

        <form method="dialog" onSubmit={burn} className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className={LABEL}>Power</span>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-11 w-20 rounded-sm border border-border bg-bg px-3 font-mono text-base"
            />
          </label>
          <button type="submit" className={PRIMARY}>
            Burn
          </button>
          <button type="button" onClick={() => dialog.current?.close()} className={QUIET}>
            Cancel
          </button>
        </form>
      </dialog>
    </>
  );
}
