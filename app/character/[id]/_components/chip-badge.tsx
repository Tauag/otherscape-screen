/** A chip's status note: BURNT, outranked, crispy, 1x. */
export function ChipBadge({ children }: { children: string }) {
	return (
		<span className="shrink-0 bg-badge text-burnt px-1 py-0.5 font-mono text-[8px] font-bold tracking-[0.08em] no-underline">
			{children}
		</span>
	);
}
