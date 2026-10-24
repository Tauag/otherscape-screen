const TONES = {
	dim: "text-dim",
	muted: "text-muted",
	negative: "text-negative-text",
};

/** The small caps label in a card's header row. One look for every card, panel,
 *  and share block; `tone` dims it for an unfinished card or flags an overspend. */
export function CardLabel({
	tone = "dim",
	children,
}: {
	tone?: keyof typeof TONES;
	children: React.ReactNode;
}) {
	return (
		<span
			className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${TONES[tone]}`}
		>
			{children}
		</span>
	);
}
