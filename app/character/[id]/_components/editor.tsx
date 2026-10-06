import Link from "next/link";
import { FILLED } from "@/app/character/[id]/_components/styles";

// The editor routes' layout (theme, crew, loadout): one column on the phone,
// and at lg a header over a main column and a sticky side column.

export const EDITOR_PAGE =
	"mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-3 pb-8 lg:max-w-6xl lg:gap-6 lg:px-8 lg:pt-6";
export const EDITOR_HEADER =
	"flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-8 lg:border-b lg:border-edge lg:pb-6";
/** The header's left half, beside EDITOR_TRACKS. */
export const EDITOR_HEADING = "flex min-w-0 flex-col gap-5 lg:flex-1 lg:gap-3";
export const EDITOR_TITLE =
	"font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-[var(--hue-title)] uppercase [text-shadow:0_0_20px_color-mix(in_oklab,var(--hue)_38%,transparent)] lg:text-[34px]";
export const EDITOR_TRACKS =
	"flex items-start gap-[10px] lg:w-[440px] lg:shrink-0";
export const EDITOR_GRID =
	"grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6";
export const EDITOR_COLUMN = "flex flex-col gap-5 lg:gap-6";
export const EDITOR_ASIDE = "flex flex-col gap-5 lg:sticky lg:top-6 lg:gap-4";

/** Flat on the phone; at lg each section becomes a board-style panel. */
export const PANEL =
	"flex flex-col gap-2 lg:rounded-md lg:border lg:border-border lg:bg-surface lg:p-4";
export const HUE_PANEL = `${PANEL} lg:border-t-[3px] lg:border-t-[var(--hue)]`;

/** Every edit already autosaves, so Save is only the way back. */
export function SaveLink({ href }: { href: string }) {
	return (
		<Link href={href} className={FILLED}>
			Save
		</Link>
	);
}
