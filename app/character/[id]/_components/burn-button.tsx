"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { Toggle } from "@base-ui/react/toggle";
import { useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";
import { DIALOG_BACKDROP, DIALOG_POPUP, HEADING, LABEL, PRIMARY, QUIET } from "@/app/character/[id]/_components/styles";

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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(DEFAULT_BURN_VALUE));

  function handleOpenChange(next: boolean) {
    if (next) setValue(String(DEFAULT_BURN_VALUE));
    setOpen(next);
  }

  // Toggle is controlled by `burnt`, so a press while unburnt only requests
  // the open state; the flip to burnt happens once the dialog's form submits.
  function handlePressedChange(pressed: boolean) {
    if (pressed) {
      handleOpenChange(true);
    } else {
      dispatch({ type: "unburnTag", themeId, tagId });
    }
  }

  function burn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number.parseInt(value, 10);
    dispatch({
      type: "burnTag",
      themeId,
      tagId,
      burnValue: Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BURN_VALUE,
    });
    setOpen(false);
  }

  return (
    <>
      <Toggle
        pressed={burnt}
        onPressedChange={handlePressedChange}
        aria-label={burnt ? `Un-burn ${named}` : `Burn ${named}`}
        className={ICON_BUTTON}
      >
        <FlameIcon burnt={burnt} />
      </Toggle>

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className={DIALOG_BACKDROP} />
          <Dialog.Popup className={DIALOG_POPUP}>
            <Dialog.Title className={HEADING}>Burn {named}</Dialog.Title>
            <p className="mt-2 font-sans text-sm text-dim">
              A burnt tag adds its value once, then reads as burnt until you un-burn it. Theme
              specials burn for 4 or 5.
            </p>

            <form onSubmit={burn} className="mt-4 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className={LABEL}>Power</span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="min-h-11 w-20 rounded-sm border border-border bg-bg px-3 font-mono text-base"
                />
              </label>
              <Button type="submit" className={PRIMARY}>
                Burn
              </Button>
              <Dialog.Close className={QUIET}>Cancel</Dialog.Close>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
