"use client";

// The pieces the sheet and the theme screen both draw. Neither one learns its
// theme type: `data-type` sits on the screen's root and the hue rides down.

import { useId, useRef, useState } from "react";
import { useCharacter } from "@/app/character/[id]/provider";
import { marksTo, type TrackName } from "@/lib/character/theme";
import {
  DECAY_TRACK_LENGTH,
  DEFAULT_BURN_VALUE,
  UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

export const LABEL = "font-mono text-[10px] tracking-[0.08em] text-faint uppercase";

const TRACKS: Record<TrackName, { name: string; length: number }> = {
  upgrade: { name: "Upgrade", length: UPGRADE_TRACK_LENGTH },
  decay: { name: "Decay", length: DECAY_TRACK_LENGTH },
};

const DIALOG =
  "m-auto w-[90vw] max-w-[420px] rounded-md border border-border bg-surface p-5 text-text backdrop:bg-bg/80";
const HEADING = "font-display text-base font-bold tracking-[0.08em] uppercase";
const PRIMARY =
  "inline-flex min-h-11 items-center rounded-sm bg-primary px-4 font-display text-sm font-bold tracking-[0.08em] text-bg uppercase";
const QUIET =
  "inline-flex min-h-11 items-center rounded-sm border border-border px-4 font-display text-sm font-semibold tracking-[0.08em] uppercase";

/** The same track on both screens, so either one can mark it. */
export function Track({
  themeId,
  track,
  marked,
}: {
  themeId: string;
  track: TrackName;
  marked: number;
}) {
  const { dispatch } = useCharacter();
  const { name, length } = TRACKS[track];
  const upgrade = useRef<HTMLDialogElement>(null);

  function mark(index: number) {
    dispatch({ type: "markTrack", themeId, track, index });
    // markTrack clears a filled Upgrade track, so the dialog is the only record
    // of what the three points bought.
    if (track === "upgrade" && marksTo(marked, index) >= length) upgrade.current?.showModal();
  }

  return (
    <>
      <div className="flex items-center gap-1" role="group" aria-label={`${name} track`}>
        <p className={LABEL}>{name}</p>
        {Array.from({ length }, (_, index) => (
          <label key={index} className="grid size-11 place-items-center">
            <input
              type="checkbox"
              checked={index < marked}
              onChange={() => mark(index)}
              className="size-[18px] accent-[var(--hue)]"
            />
            <span className="sr-only">{`${name} ${index + 1} of ${length}`}</span>
          </label>
        ))}
      </div>

      {track === "upgrade" && <UpgradeDialog themeId={themeId} ref={upgrade} />}
    </>
  );
}

function UpgradeDialog({
  themeId,
  ref,
}: {
  themeId: string;
  ref: React.RefObject<HTMLDialogElement | null>;
}) {
  const { dispatch } = useCharacter();
  const [special, setSpecial] = useState("");
  const headingId = useId();

  function takeTag() {
    // lazy: the tag lands on question A and the player moves it, since nothing
    // here knows the questions. Upgrade path: T29's picker route.
    dispatch({ type: "addPowerTag", themeId, id: crypto.randomUUID(), letter: "A" });
    ref.current?.close();
  }

  function takeSpecial() {
    // `required` stops an empty field, but not a field holding only spaces.
    const text = special.trim();
    if (text) dispatch({ type: "addThemeSpecial", themeId, special: text });
    setSpecial("");
  }

  return (
    /* lazy: the native dialog gives the focus trap, the backdrop, and Escape
       dismissal for free. Ceiling: showModal is all it gives. Upgrade path:
       @base-ui/react Dialog when a dialog needs more than that. */
    <dialog ref={ref} aria-labelledby={headingId} className={DIALOG}>
      <h2 id={headingId} className={HEADING}>
        Take an Upgrade
      </h2>
      <p className="mt-2 font-sans text-sm text-dim">
        Three points, one Upgrade. Take a new power tag, which may answer any question, or a theme
        special. The track is clear either way, and the theme screen can still add both later.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <button type="button" onClick={takeTag} className={PRIMARY}>
          New power tag
        </button>

        {/* method="dialog" closes on submit, and `required` says so in the
            browser's own words rather than disabling the button. */}
        <form method="dialog" onSubmit={takeSpecial} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            required
            value={special}
            onChange={(event) => setSpecial(event.target.value)}
            aria-label="Theme special"
            placeholder="A theme special, in your own words"
            className="min-h-11 min-w-32 flex-1 rounded-sm border border-border bg-bg px-3 font-sans text-base"
          />
          <button type="submit" className={PRIMARY}>
            Take special
          </button>
        </form>

        <button type="button" onClick={() => ref.current?.close()} className={`${QUIET} self-start`}>
          Not now
        </button>
      </div>
    </dialog>
  );
}

/** T26: the value is per burn, so burning asks for it and un-burning does not. */
export function BurnButton({
  themeId,
  tagId,
  burnt,
  named,
}: {
  themeId: string;
  tagId: string;
  burnt: boolean;
  /** The tag as a sentence names it, for the buttons a screen reader reads. */
  named: string;
}) {
  const { dispatch } = useCharacter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(String(DEFAULT_BURN_VALUE));
  const headingId = useId();

  function open() {
    // Every burn starts at the default. The last burn's override was that
    // burn's, not this tag's.
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

/** T55: a full Decay track is a sentence. It blocks no edit and loses nothing. */
export function DecayWarning() {
  return (
    <p className="font-sans text-sm text-negative-text">
      The Decay track is full. This theme can be lost now, when the table says so. Nothing happens
      until you lose it, and unmarking a box takes it back.
    </p>
  );
}

/**
 * T54: the button any trigger reaches for. It never reads the Decay track, and
 * it asks first, because the sheet cannot bring a lost theme back.
 */
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
