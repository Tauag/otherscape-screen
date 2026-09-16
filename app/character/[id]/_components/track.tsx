"use client";

import { useId, useRef, useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { TrackName } from "@/lib/character/theme";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { DIALOG, HEADING, PRIMARY, QUIET } from "@/app/character/[id]/_components/styles";

const TRACKS: Record<TrackName, { name: string; short: string; length: number }> = {
  upgrade: { name: "Upgrade", short: "UPG", length: UPGRADE_TRACK_LENGTH },
  decay: { name: "Decay", short: "DEC", length: DECAY_TRACK_LENGTH },
};

/** The two sizes Track draws: the sheet's header-row pips, and the theme
 *  screen's panel pips. One prop, not a second component. */
type TrackSize = "sm" | "lg";

const PIP_SIZE: Record<TrackSize, string> = { sm: "size-[12px]", lg: "size-[18px]" };

/** The glow radius scales with the pip: 6px at 9px, 9px at 18px. Decay never glows. */
const GLOW: Record<TrackSize, string> = {
  sm: "shadow-[0_0_6px_color-mix(in_oklab,var(--hue)_60%,transparent)]",
  lg: "shadow-[0_0_9px_color-mix(in_oklab,var(--hue)_60%,transparent)]",
};

/** The same track on both screens, so either one can mark it. `size` picks the
 *  sheet's small header-row pips or the theme screen's large panel pips; the
 *  control and its accessibility markup are identical either way. */
export function Track({
  themeId,
  track,
  marked,
  size,
}: {
  themeId: string;
  track: TrackName;
  marked: number;
  size: TrackSize;
}) {
  const { dispatch } = useCharacter();
  const { name, short, length } = TRACKS[track];
  const upgrade = useRef<HTMLDialogElement>(null);

  function mark() {
    const willComplete = track === "upgrade" && marked + 1 >= length;
    dispatch({ type: "markTrack", themeId, track });
    if (willComplete) upgrade.current?.showModal();
  }

  const upgradeTrack = track === "upgrade";

  return (
    <>
      <div
        className={
          size === "sm"
            ? "flex items-center gap-1"
            : `flex flex-1 flex-col gap-2 rounded-[5px] border px-3 py-[11px] ${
                upgradeTrack ? "border-[var(--hue)] bg-[var(--hue)]/7" : "border-border bg-surface"
              }`
        }
      >
        {size === "sm" ? (
          <p className="font-mono text-[10px] tracking-[0.1em] text-faint">{short}</p>
        ) : (
          <p
            className={`font-mono text-[9px] font-bold tracking-[0.16em] ${
              upgradeTrack ? "text-[var(--hue)]/90" : "text-faint"
            }`}
          >
            {name.toUpperCase()} {marked}/{length}
          </p>
        )}

        <button
          type="button"
          onClick={mark}
          aria-label={`${name} track, ${marked} of ${length} marked. Click to mark one.`}
          className={`flex cursor-pointer rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            size === "sm" ? "gap-[3px]" : "gap-1.5"
          }`}
        >
          {Array.from({ length }, (_, index) => {
            const lit = index < marked;
            return (
              <span
                key={index}
                aria-hidden="true"
                className={`${PIP_SIZE[size]} ${
                  lit
                    ? upgradeTrack
                      ? `bg-[var(--hue)] ${GLOW[size]}`
                      : "bg-muted"
                    : "border border-pip"
                }`}
              />
            );
          })}
        </button>
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
