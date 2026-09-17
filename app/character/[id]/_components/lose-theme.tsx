"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { DANGER, LABEL, QUIET } from "@/app/character/[id]/_components/styles";

/** Split from its dialog so the sheet's card can keep the button inside its
 *  Link and put the dialog outside: a dialog under that Link portals out of
 *  the DOM but stays in the React tree, so its clicks bubble into the Link
 *  and navigate. */
export function LoseThemeButton({ named, onOpen }: { named: string; onOpen: () => void }) {
  return (
    <Button
      type="button"
      aria-label={`Lose ${named}`}
      // The sheet's card is a single Link to the theme screen; preventDefault
      // stops that navigation so the button only opens the dialog.
      onClick={(event) => {
        event.preventDefault();
        onOpen();
      }}
      className={`${DANGER} self-start`}
    >
      Lose this theme
    </Button>
  );
}

export function LoseThemeDialog({
  themeId,
  named,
  open,
  onOpenChange,
  onLost,
}: {
  themeId: string;
  /** The theme as a sentence names it, for the heading and the screen reader. */
  named: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The theme screen leaves for the sheet, since its own route is now empty. */
  onLost?: () => void;
}) {
  const { dispatch } = useCharacter();
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
    onOpenChange(false);
    onLost?.();
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Lose ${named}?`}
      description="The theme leaves the sheet and is archived whole in ghost memories: every tag, the specials, and both track marks. The sheet cannot bring it back."
      cancelLabel={null}
    >
      <form onSubmit={lose} className="flex flex-col gap-3">
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
          <Button type="submit" className="inline-flex min-h-11 items-center rounded-sm text-bg bg-danger px-4 font-display text-sm font-bold tracking-[0.08em] uppercase">
            Lose the theme
          </Button>
          <Dialog.Close className={QUIET}>Cancel</Dialog.Close>
        </div>
      </form>
    </ConfirmDialog>
  );
}
