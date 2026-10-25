import { ChipBadge } from "@/components/chip-badge";
import type { ThemeType } from "@/lib/character/types";

export function Chip({
	label,
	text,
	burnt,
	negative,
	broad,
	stowed,
	type,
}: {
	label: string;
	text: string;
	burnt?: boolean;
	burnValue?: number;
	negative?: boolean;
	broad?: boolean;
	/** Written on the sheet but not loaded, so not usable in play. */
	stowed?: boolean;
	/** Set when the tag's hue differs from its card's: a tag borrowed from another type. */
	type?: ThemeType;
}) {
	return (
		<li
			data-type={type}
			data-burnt={burnt ? "true" : undefined}
			data-stowed={stowed ? "true" : undefined}
			data-valence={negative ? "negative" : undefined}
			className={`notched flex items-center gap-[7px] border px-[9px] py-1.5 ${
				stowed
					? "border-dashed border-pip opacity-60"
					: burnt
						? "border-dashed border-pip bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgba(255,255,255,.025)_4px_8px)]"
						: "border-[var(--hue)]/32 bg-[var(--hue)]/7"
			}`}
		>
			<span
				className={`font-mono text-[9px] font-bold ${burnt || stowed ? "text-faint" : "text-[var(--hue)]/80"}`}
			>
				{label}
			</span>
			<span
				className={`font-display text-[13px] ${burnt ? "text-muted line-through" : stowed ? "text-muted" : "text-[var(--hue-text)]"}`}
			>
				{text}
			</span>
			{broad && <ChipBadge>BROAD</ChipBadge>}
			{burnt && <ChipBadge>BURNT</ChipBadge>}
			{stowed && <ChipBadge>STOWED</ChipBadge>}
		</li>
	);
}
