"use client";

import { useId, useRef, useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { DIALOG, HEADING, LABEL, PRIMARY, QUIET } from "@/app/character/[id]/_components/styles";

const ICON_BUTTON =
  "grid size-11 shrink-0 place-items-center rounded-sm border border-border text-[var(--hue)]";

function FlameIcon({ burnt }: { burnt: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={burnt ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
    </svg>
  );
}

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
        className={ICON_BUTTON}
      >
        <FlameIcon burnt />
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={open} aria-label={`Burn ${named}`} className={ICON_BUTTON}>
        <FlameIcon burnt={false} />
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
