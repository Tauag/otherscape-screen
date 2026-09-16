"use client";

import { useId, useRef, useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { DIALOG, HEADING, LABEL, PRIMARY, QUIET } from "@/app/character/[id]/_components/styles";

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
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const headingId = useId();

  function lose() {
    // The id and the timestamp are minted here: the reducer stays pure.
    dispatch({
      type: "loseTheme",
      themeId,
      id: crypto.randomUUID(),
      lostAt: new Date().toISOString(),
      reason: reason.trim(),
    });
    setReason("");
    onLost?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Lose ${named}`}
        className={`${QUIET} self-start border-negative text-negative-text`}
      >
        Lose this theme
      </button>

      <dialog ref={dialog} aria-labelledby={headingId} className={DIALOG}>
        <h2 id={headingId} className={HEADING}>
          Lose {named}?
        </h2>
        <p className="mt-2 font-sans text-sm text-dim">
          The theme leaves the sheet and is archived whole in ghost memories: every tag, the
          specials, and both track marks. The sheet cannot bring it back.
        </p>

        {/* method="dialog" closes on submit, and `required` holds the reason the
            archive keeps, in the browser's own words. */}
        <form method="dialog" onSubmit={lose} className="mt-4 flex flex-col gap-3">
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
            <button type="submit" className={PRIMARY}>
              Lose the theme
            </button>
            <button type="button" onClick={() => dialog.current?.close()} className={QUIET}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
