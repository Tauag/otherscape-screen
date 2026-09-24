export function Pips({
	name,
	marked,
	length,
}: {
	name: string;
	marked: number;
	length: number;
}) {
	return (
		<div className="flex items-center gap-1">
			<p className="font-mono text-[10px] tracking-[0.1em] text-faint">
				{name}
			</p>
			<span
				role="img"
				aria-label={`${name}, ${marked} of ${length} marked`}
				className="flex gap-[3px]"
			>
				{Array.from({ length }, (_, index) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length counter, position is the identity.
						key={index}
						aria-hidden="true"
						className={`size-[12px] ${index < marked ? "bg-muted" : "border border-pip"}`}
					/>
				))}
			</span>
		</div>
	);
}
