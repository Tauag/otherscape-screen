import type { Status } from "@/lib/character/types";

export function StatusRow({ status }: { status: Status }) {
	return (
		<div
			data-valence={status.valence}
			className="flex items-center justify-between gap-2 rounded-sm border border-[var(--hue)]/32 bg-[var(--hue)]/7 px-[9px] py-1.5"
		>
			<span
				className={`font-display text-[13px] ${status.out ? "text-muted line-through" : "text-[var(--hue-text)]"}`}
			>
				{status.name || "Unnamed"}
			</span>
			<span
				role="img"
				aria-label={`tier ${status.tiers.filter(Boolean).length}`}
				className="flex gap-[3px]"
			>
				{status.tiers.map((marked, index) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: a fixed-length tier track, position is the identity.
						key={index}
						aria-hidden="true"
						className={`size-[10px] rounded-full ${marked ? "bg-[var(--hue)]" : "border border-pip"}`}
					/>
				))}
			</span>
		</div>
	);
}
