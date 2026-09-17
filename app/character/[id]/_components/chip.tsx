import { DEFAULT_BURN_VALUE } from "@/lib/rules/constants";

/** Not a control, so unlike Track's mark button this carries no touch target of its own.
 *  Shared by the sheet's theme cards and the menu's ghost memory entries. */
export function Chip({
	label,
	text,
	burnt,
	burnValue,
	negative,
}: {
	label: string;
	text: string;
	burnt?: boolean;
	burnValue?: number;
	negative?: boolean;
}) {
	return (
		<li
			data-burnt={burnt ? "true" : undefined}
			data-valence={negative ? "negative" : undefined}
			className={`flex items-center gap-[7px] rounded-sm border px-[9px] py-1.5 ${
				burnt
					? "border-dashed border-pip bg-[repeating-linear-gradient(135deg,transparent_0_4px,rgba(255,255,255,.025)_4px_8px)]"
					: "border-[var(--hue)]/32 bg-[var(--hue)]/7"
			}`}
		>
			<span
				className={`font-mono text-[9px] font-bold ${burnt ? "text-faint" : "text-[var(--hue)]/80"}`}
			>
				{label}
			</span>
			<span
				className={`font-display text-[13px] ${burnt ? "text-muted line-through" : "text-[var(--hue-text)]"}`}
			>
				{text}
			</span>
			{burnt && (
				<span className="bg-badge text-burnt px-1 py-0.5 font-mono text-[8px] font-bold tracking-[0.08em]">
					BURNT {burnValue ?? DEFAULT_BURN_VALUE}P
				</span>
			)}
		</li>
	);
}
