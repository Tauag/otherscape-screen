"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { TrackName } from "@/lib/character/theme";
import { DECAY_TRACK_LENGTH, UPGRADE_TRACK_LENGTH } from "@/lib/rules/constants";
import { ConfirmDialog } from "@/app/character/[id]/_components/confirm-dialog";
import { PRIMARY } from "@/app/character/[id]/_components/styles";

const TRACKS: Record<TrackName, { name: string; short: string; length: number }> = {
  upgrade: { name: "Upgrade", short: "UPG", length: UPGRADE_TRACK_LENGTH },
  decay: { name: "Decay", short: "DEC", length: DECAY_TRACK_LENGTH },
};

/** The two sizes a track draws at: the sheet's header-row pips, and the
 *  theme (or loadout) screen's panel pips. One prop, not a second component. */
export type TrackSize = "sm" | "lg";

const PIP_SIZE: Record<TrackSize, string> = { sm: "size-[12px]", lg: "size-[18px]" };
const GLOW: Record<TrackSize, string> = {
  sm: "shadow-[0_0_6px_color-mix(in_oklab,var(--hue,var(--color-muted))_60%,transparent)]",
  lg: "shadow-[0_0_9px_color-mix(in_oklab,var(--hue,var(--color-muted))_60%,transparent)]",
};

type TrackPipsProps = {
  name: string;
  short: string;
  length: number;
  marked: number;
  size: TrackSize;
  active: boolean;
  onMark: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * A row of pips in a single button: one click marks the next one, wrapping
 * back to empty once the last one fills. Presentational and domain-agnostic
 * - a theme's Upgrade or Decay track and the loadout's Upgrade track all
 * draw through this; each caller owns what a click and a full track actually
 * do. `active` is the glowing, about-to-pay-off state (an Upgrade track);
 * a plain track (Decay) reads neutral.
 */
export function TrackPips({
  name,
  short,
  length,
  marked,
  size,
  active,
  onMark,
}: TrackPipsProps) {
  return (
    <div
      className={
        size === "sm"
          ? "flex items-center gap-1"
          : `flex flex-1 flex-col gap-2 rounded-[5px] border px-3 py-[11px] ${
              active
                ? "border-[var(--hue,var(--color-muted))] bg-[var(--hue,var(--color-muted))]/7"
                : "border-border bg-surface"
            }`
      }
    >
      {size === "sm" ? (
        <p className="font-mono text-[10px] tracking-[0.1em] text-faint">{short}</p>
      ) : (
        <p
          className={`font-mono text-[9px] font-bold tracking-[0.16em] ${
            active ? "text-[var(--hue,var(--color-muted))]/90" : "text-faint"
          }`}
        >
          {name.toUpperCase()} {marked}/{length}
        </p>
      )}

      <Button
        type="button"
        onClick={onMark}
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
                  ? active
                    ? `bg-[var(--hue,var(--color-muted))] ${GLOW[size]}`
                    : "bg-muted"
                  : "border border-pip"
              }`}
            />
          );
        })}
      </Button>
    </div>
  );
}

/** The same track on both screens, so either one can mark it. `size` picks the
 *  sheet's small header-row pips or the theme screen's large panel pips; the
 *  control and its accessibility markup are identical either way. */
export function Track({
  themeId,
  themeHref,
  nascent,
  track,
  marked,
  size,
}: {
  themeId: string;
  /** The theme screen's own URL, so a completed Upgrade can land there. */
  themeHref: string;
  /** A nascent theme upgrades toward its missing power tags first, so the
   *  Upgrade dialog offers only that until the theme is full. */
  nascent: boolean;
  track: TrackName;
  marked: number;
  size: TrackSize;
}) {
  const { dispatch } = useCharacter();
  const { name, short, length } = TRACKS[track];
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function mark(event: React.MouseEvent<HTMLButtonElement>) {
    // The sheet's card is a single Link to the theme screen; preventDefault stops
    // that navigation so a track click only marks the box.
    event.preventDefault();
    const willComplete = track === "upgrade" && marked + 1 >= length;
    dispatch({ type: "markTrack", themeId, track });
    if (willComplete) setUpgradeOpen(true);
  }

  return (
    <>
      <TrackPips
        name={name}
        short={short}
        length={length}
        marked={marked}
        size={size}
        active={track === "upgrade"}
        onMark={mark}
      />

      {track === "upgrade" && (
        <UpgradeDialog
          themeId={themeId}
          themeHref={themeHref}
          nascent={nascent}
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
        />
      )}
    </>
  );
}

function UpgradeDialog({
  themeId,
  themeHref,
  nascent,
  open,
  onOpenChange,
}: {
  themeId: string;
  themeHref: string;
  nascent: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { dispatch } = useCharacter();
  const router = useRouter();

  function takeTag() {
    // lazy: the tag lands on question A and the player moves it, since nothing
    // here knows the questions. Upgrade path: T29's picker route.
    const id = crypto.randomUUID();
    dispatch({ type: "addPowerTag", themeId, id, letter: "A" });
    onOpenChange(false);
    router.push(`${themeHref}#tag-${id}`);
  }

  function takeSpecial() {
    onOpenChange(false);
    router.push(`${themeHref}/specials`);
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Take an Upgrade"
      description={
        nascent
          ? "Three points, one Upgrade. A nascent theme takes a new power tag until it has all three."
          : "Three points, one Upgrade. Take a new power tag, which may answer any question, or a theme special."
      }
    >
      <Button type="button" onClick={takeTag} className={PRIMARY}>
        New power tag
      </Button>
      {!nascent && (
        <Button type="button" onClick={takeSpecial} className={PRIMARY}>
          New theme special
        </Button>
      )}
    </ConfirmDialog>
  );
}
