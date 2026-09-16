"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { DIALOG_BACKDROP, DIALOG_POPUP, HEADING, LABEL, PRIMARY, QUIET } from "@/app/character/[id]/_components/styles";

export function LoseTheme({
  themeId,
  named,
  onLost,
}: {
  themeId: string;
  /** The theme as a sentence names it, for the heading and the screen reader. */
  named: string;
  /** The theme screen leaves for the sheet, since its own route is now empty. */
  onLost?: () => void;
}) {
  const { dispatch } = useCharacter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  function lose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The id and the timestamp are minted here: the reducer stays pure.
    dispatch({
      type: "loseTheme",
      themeId,
      id: crypto.randomUUID(),
      lostAt: new Date().toISOString(),
      reason: reason.trim(),
    });
    setReason("");
    setOpen(false);
    onLost?.();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={`Lose ${named}`}
        className={`${QUIET} self-start border-negative text-negative-text`}
      >
        Lose this theme
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className={DIALOG_BACKDROP} />
        <Dialog.Popup className={DIALOG_POPUP}>
          <Dialog.Title className={HEADING}>Lose {named}?</Dialog.Title>
          <p className="mt-2 font-sans text-sm text-dim">
            The theme leaves the sheet and is archived whole in ghost memories: every tag, the
            specials, and both track marks. The sheet cannot bring it back.
          </p>

          <form onSubmit={lose} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Why it was lost</span>
              <textarea
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Decay filled the night she let the lantern go out"
                className="min-h-11 rounded-sm border border-border bg-bg p-3 font-sans text-base field-sizing-content"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" className={PRIMARY}>
                Lose the theme
              </Button>
              <Dialog.Close className={QUIET}>Cancel</Dialog.Close>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
