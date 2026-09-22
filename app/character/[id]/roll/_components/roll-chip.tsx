"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { BurnButton } from "@/app/character/[id]/_components/burn-button";
import { ChipBadge } from "@/components/chip-badge";
import type { ThemeType, Valence } from "@/lib/character/types";

const VALUE = "shrink-0 font-mono text-[11px] font-bold";

type Props = {
	text: string;
	/** The signed Power this chip carries, absent while it is not selected. */
	value?: string;
	/** BURNT on a burnt tag; outranked or crispy on a chip that adds nothing to
	 *  spend; locked on a chip a mitigation roll can't use. */
	badge?: "BURNT" | "outranked" | "crispy" | "locked";
	type?: ThemeType | "crew" | "loadout";
	valence?: Valence;
	burnt?: boolean;
	/** The tag an Evolution unlocked. Independent of `badge`: a broad tag can also be burnt. */
	broad?: boolean;
	/** A theme's title tag on the board: the label reads larger and bolder. */
	prominent?: boolean;
	selected: boolean;
	/** False while the chip is outranked, scratched, or stopped by a theme type. */
	counted: boolean;
	/** Absent when the chip is out of play: it then renders no control at all. */
	onToggle?: () => void;
	/** Set on a selected burnt tag, to open the burn value override. */
	onValueClick?: () => void;
	/**
	 * Set on a selected tag that can burn: burnt already (to un-burn, undoing
	 * a misclick) or not yet and free to (only one tag burns per roll).
	 */
	onBurntChange?: (burnt: boolean) => void;
};

export function RollChip({
	text,
	value,
	badge,
	type,
	valence,
	burnt,
	broad,
	prominent,
	selected,
	counted,
	onToggle,
	onValueClick,
	onBurntChange,
}: Props) {
	const named = text.trim() || "Unnamed";

	// Out of play and not part of this roll, or selected and outranked: one
	// spent look either way. A burnt tag still in this roll's pick keeps the
	// normal selected look, so burning mid-roll doesn't grey out its own chip.
	const spent = (onToggle === undefined && !selected) || (selected && !counted);
	const tone = spent
		? "border-pip bg-recess"
		: selected
			? `border-[var(--hue)] bg-[var(--hue)]/16 ${burnt ? "" : "shadow-[0_0_14px_color-mix(in_oklab,var(--hue)_22%,transparent)]"}`
			: "border-[var(--hue)]/30";
	const ink = spent
		? "text-faint line-through"
		: selected
			? "text-[var(--hue-text)]"
			: "text-[var(--hue-text)]/70";

	const body = (
		<>
			<span
				className={`font-display ${prominent ? "text-[15px] font-bold" : "text-[13px]"} ${ink}`}
			>
				{named}
			</span>
			{broad && <ChipBadge>BROAD</ChipBadge>}
			{badge && <ChipBadge>{badge}</ChipBadge>}
			{value !== undefined && !onValueClick && (
				<span className={`${VALUE} ${ink}`}>{value}</span>
			)}
		</>
	);

	const fill = "flex min-h-11 items-center gap-[7px] px-2.5 text-left";

	return (
		<li
			data-type={type}
			data-valence={valence}
			data-burnt={burnt ? "true" : undefined}
			className={`flex rounded-sm border ${tone}`}
		>
			{onToggle ? (
				<Toggle
					pressed={selected}
					onPressedChange={onToggle}
					className={`${fill} min-w-0 flex-1`}
				>
					{body}
				</Toggle>
			) : (
				// Out of play: no control, so there is nothing to press.
				<span className={fill}>{body}</span>
			)}

			{value !== undefined && onValueClick && (
				<Button
					type="button"
					onClick={onValueClick}
					aria-label={`Change the burn value of ${named}`}
					className={`${VALUE} ${ink} grid min-h-11 w-11 shrink-0 place-items-center border-l border-[var(--hue)]/30`}
				>
					{value}
				</Button>
			)}

			{onBurntChange && (
				<div className="ml-auto">
					<BurnButton
						burnt={!!burnt}
						onBurntChange={onBurntChange}
						named={named}
					/>
				</div>
			)}
		</li>
	);
}
