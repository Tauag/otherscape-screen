"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";
import { UpArrowIcon } from "@/app/character/[id]/_components/icons";
import { FILLED } from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { TrackName } from "@/lib/character/theme";
import {
	DECAY_TRACK_LENGTH,
	UPGRADE_TRACK_LENGTH,
} from "@/lib/rules/constants";

const TRACKS: Record<
	TrackName,
	{ name: string; short: string; length: number }
> = {
	upgrade: { name: "Upgrade", short: "UPG", length: UPGRADE_TRACK_LENGTH },
	decay: { name: "Decay", short: "DEC", length: DECAY_TRACK_LENGTH },
};

/** The two sizes a track draws at: the sheet's header-row pips, and the
 *  theme (or loadout) screen's panel pips. One prop, not a second component. */
export type TrackSize = "sm" | "lg";

const PIP_SIZE: Record<TrackSize, string> = {
	sm: "size-[12px]",
	lg: "size-[18px]",
};
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
				<p className="font-mono text-[10px] tracking-[0.1em] text-faint">
					{short}
				</p>
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
							// biome-ignore lint/suspicious/noArrayIndexKey: pips are a fixed-length counter with no data of their own; position is the identity.
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

type TrackProps = {
	themeId: string;
	track: TrackName;
	marked: number;
	size: TrackSize;
};

export function Track({ themeId, track, marked, size }: TrackProps) {
	const { dispatch } = useCharacter();
	const { name, short, length } = TRACKS[track];

	function mark(event: React.MouseEvent<HTMLButtonElement>) {
		// The sheet's card is a single Link to the theme screen; preventDefault stops
		// that navigation so a track click only marks the box.
		event.preventDefault();
		dispatch({ type: "markTrack", themeId, track });
	}

	return (
		<TrackPips
			name={name}
			short={short}
			length={length}
			marked={marked}
			size={size}
			active={track === "upgrade"}
			onMark={mark}
		/>
	);
}

/**
 * A filled Upgrade track clears itself, so it can't stay visibly "full" to
 * remind the player an Upgrade is owed - this badge is that reminder instead,
 * persisted on the card so it survives a reload or a session's worth of
 * rolls. Shown next to the track; opens the same UpgradeDialog a manual mark
 * used to open automatically. Always calls preventDefault, same as Track's
 * mark, so it's safe under a card's wrapping Link too.
 */
export function UpgradeBadge({
	pending,
	onOpen,
}: {
	pending: number;
	onOpen: () => void;
}) {
	if (pending <= 0) return null;

	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		onOpen();
	}

	return (
		<Button
			type="button"
			aria-label={
				pending > 1 ? `${pending} upgrades pending` : "1 upgrade pending"
			}
			onClick={handleClick}
			className="shrink-0 rounded-full border border-[var(--hue,var(--color-muted))] bg-[var(--hue,var(--color-muted))]/12 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] text-[var(--hue,var(--color-muted))] uppercase"
		>
			{pending > 1 ? `↑ x ${pending}` : "↑"}
		</Button>
	);
}

/**
 * The theme screen's larger, square take on UpgradeBadge: an up arrow over
 * the word "Upgrade", both inside one button. Same trigger, same
 * preventDefault safety, just a different shape for a page with more room.
 */
export function UpgradeSquareButton({
	pending,
	onOpen,
}: {
	pending: number;
	onOpen: () => void;
}) {
	if (pending <= 0) return null;

	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		onOpen();
	}

	return (
		<Button
			type="button"
			onClick={handleClick}
			aria-label={
				pending > 1 ? `${pending} upgrades pending` : "1 upgrade pending"
			}
			className="flex flex-col h-[64px] w-[64px] items-center justify-center gap-0.5 rounded-sm border border-[var(--hue,var(--color-muted))] bg-[var(--hue,var(--color-muted))]/12 text-[var(--hue,var(--color-muted))]"
		>
			<UpArrowIcon />
			<span className="font-mono text-[10px] font-bold tracking-[0.06em] uppercase">
				Upgrade
			</span>
		</Button>
	);
}

export function UpgradeDialog({
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
		const id = crypto.randomUUID();
		dispatch({ type: "addPowerTag", themeId, id, letter: "A" });
		dispatch({ type: "takeThemeUpgrade", themeId });
		onOpenChange(false);
		router.push(`${themeHref}#tag-${id}`);
	}

	function takeWeakness() {
		const id = crypto.randomUUID();
		dispatch({ type: "addWeaknessTag", themeId, id, letter: "A" });
		onOpenChange(false);
		router.push(`${themeHref}#tag-${id}`);
	}

	function takeSpecial() {
		dispatch({ type: "takeThemeUpgrade", themeId });
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
			<Button type="button" onClick={takeTag} className={FILLED}>
				+ power tag
			</Button>
			{!nascent && (
				<Button type="button" onClick={takeWeakness} className={FILLED}>
					+ weakness tag
				</Button>
			)}
			{!nascent && (
				<Button type="button" onClick={takeSpecial} className={FILLED}>
					+ theme special
				</Button>
			)}
		</ConfirmDialog>
	);
}
