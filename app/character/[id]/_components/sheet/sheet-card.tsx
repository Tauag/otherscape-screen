import Link from "next/link";
import type { ThemeType } from "@/lib/character/types";

/**
 * The sheet's card chrome: one Link to the card's editor, with the hue stripe
 * down its left edge. `faded` is the dashed, dimmed look of a card still under
 * construction (a nascent theme, an empty loadout).
 */
export function SheetCard({
	href,
	type,
	faded,
	children,
}: {
	href: string;
	type: string;
	faded: boolean;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			data-type={type}
			className={`notched flex overflow-hidden border transition-colors ${
				faded
					? "border-dashed border-raised bg-recess hover:border-[var(--hue)]/60"
					: "border-border bg-surface hover:border-[var(--hue)]"
			}`}
		>
			<div
				aria-hidden="true"
				className={`w-[3px] shrink-0 ${faded ? "bg-[var(--hue)]/35" : "bg-[var(--hue)]"}`}
			/>

			<div className="flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5">
				{children}
			</div>
		</Link>
	);
}

/** A theme or crew card's heading: its title tag, or a prompt for one. */
export function SheetCardTitle({
	text,
	burnt,
	nascent,
	type,
}: {
	text: string | undefined;
	burnt: boolean;
	nascent: boolean;
	/** Set when the title tag comes from another type's themebook. */
	type?: ThemeType;
}) {
	if (text === undefined) {
		return (
			<h2 className="min-h-11 content-center font-sans text-sm text-dim">
				No title tag yet.
			</h2>
		);
	}

	return (
		<h2
			data-type={type}
			data-burnt={burnt ? "true" : undefined}
			className={`font-display text-[21px] leading-tight font-bold tracking-[0.045em] uppercase ${
				burnt ? "line-through" : ""
			} ${
				nascent
					? "text-[var(--hue-title)]/60"
					: "text-[var(--hue-title)] [text-shadow:0_0_20px_color-mix(in_oklab,var(--hue)_38%,transparent)]"
			}`}
		>
			{text}
		</h2>
	);
}
